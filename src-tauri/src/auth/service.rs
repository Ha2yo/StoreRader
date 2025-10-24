use axum::{extract::State, Json};
use chrono::{Duration, Utc};
use jsonwebtoken::{
    decode, decode_header, encode, Algorithm, DecodingKey, EncodingKey, Header, Validation,
};
use serde::{Deserialize, Serialize};
use sqlx::PgPool;

use crate::{
    auth::dto::{
        req::GoogleLoginReq,
        res::{GoogleLoginRes, UserRes},
    },
    config::env::get_env_value,
    repository::user::find_and_create_user,
};

pub async fn auth_google(
    pool: &PgPool,
    req: GoogleLoginReq,
) -> Result<Json<GoogleLoginRes>, String> {
    // Google 검증
    let claims = verify_google_id_token(req.id_token, req.client_id)
        .await
        .map_err(|e| format!("Google 검증 실패: {}", e))?;

    // DB 조회/생성
    let user = find_and_create_user(&pool, &claims.sub, &claims.email, &claims.name).await?;

    // JWT 발급
    let jwt = create_jwt(user.id.to_string(), user.email.clone())
        .map_err(|e| format!("JWT 생성 실패: {e}"))?;

    let response = GoogleLoginRes {
        jwt,
        user: UserRes {
            id: user.id,
            name: user.name,
            email: user.email,
        },
    };

    // 응답 반환
    Ok(Json(response))
}

// Google ID Token Claims 구조체
#[derive(Serialize, Deserialize)]
pub struct GoogleClaims {
    pub iss: String,          // 발급자
    pub sub: String,          // 고유 ID
    pub aud: String,          // 수신자 (clientId)
    pub email: String,        // 유저 이메일
    pub email_verified: bool, // 이메일 인증 여부
    pub exp: usize,           // 만료 시각
    pub iat: usize,           // 발급 시각
    pub name: String,         // 유저 이름
    pub picture: String,      // 프로필 사진 URL
}

// 구글 공개키 (JWK) 구조체
#[derive(Deserialize)]
struct Jwk {
    kid: String, // Key ID
    n: String,
    e: String,
}

#[derive(Deserialize)]
struct JwkResponse {
    keys: Vec<Jwk>,
}

// 구글 ID Token 검증 함수
pub async fn verify_google_id_token(
    id_token: String,
    client_id: String,
) -> Result<GoogleClaims, String> {
    // JWT 헤더에서 서명에 사용된 키 (kid) 추출
    let header = decode_header(&id_token).map_err(|e| format!("헤더 파싱 실패: {}", e))?;
    let kid = header.kid.ok_or("헤더에 kid 없음")?;

    // 구글 서버에서 JWKS (공개키 세트) 받아오기
    let resp = reqwest::get("https://www.googleapis.com/oauth2/v3/certs")
        .await
        .map_err(|e| format!("JWKS 요청 실패: {}", e))?;
    let jwks: JwkResponse = resp
        .json()
        .await
        .map_err(|e| format!("JWKS JSON 파싱 실패: {}", e))?;

    // kid가 일치하는 공개키 찾기
    let jwk = jwks
        .keys
        .into_iter()
        .find(|key| key.kid == kid)
        .ok_or("일치하는 공개키 없음")?;

    // RSA 검증용 키 생성
    let decoding_key = DecodingKey::from_rsa_components(&jwk.n, &jwk.e)
        .map_err(|e| format!("RSA 키 생성 실패: {}", e))?;

    // 발신자와 수신자 확인
    let mut validation = Validation::new(Algorithm::RS256);
    validation.set_audience(&[client_id.as_str()]);
    validation.set_issuer(&["https://accounts.google.com"]);

    // 토큰 검증 및 해독
    let decoded = decode::<GoogleClaims>(&id_token, &decoding_key, &validation)
        .map_err(|e| format!("ID Token 검증 실패: {}", e))?;

    Ok(decoded.claims)
}

#[derive(Serialize, Deserialize)]
pub struct JwtClaims {
    pub sub: String, // 고유 ID (user 테이블의 id 값)
    pub email: String,
    pub exp: usize,
}

pub fn create_jwt(sub: String, email: String) -> Result<String, String> {
    let exp = (Utc::now() + Duration::hours(24)).timestamp() as usize;

    let claims = JwtClaims { sub, email, exp };

    let secret = get_env_value("JWT_SECRET");
    if secret.is_empty() {
        return Err("JWT_SECRET이 설정되지 않았습니다".into());
    }

    let token = encode(
        &Header::default(),
        &claims,
        &EncodingKey::from_secret(secret.as_bytes()),
    )
    .map_err(|e| format!("JWT 생성 실패: {e}"))?;

    Ok(token)
}

pub fn decode_jwt(token: &str) -> Result<JwtClaims, String> {
    let secret = get_env_value("JWT_SECRET");
    if secret.is_empty() {
        return Err("JWT_SECRET이 설정되지 않았습니다".into());
    }

    let token_data = decode::<JwtClaims>(
        token,
        &DecodingKey::from_secret(secret.as_bytes()),
        &Validation::new(Algorithm::HS256),
    )
    .map_err(|e| format!("JWT 검증 실패: {}", e))?;

    Ok(token_data.claims)
}
