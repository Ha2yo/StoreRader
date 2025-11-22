/************************************************************************
 * File: domain/auth/service.rs
 * Description:
 *     인증(auth) 도메인의 서비스 로직을 처리한다.
 *
 * Responsibilities:
 *     1) auth_google()
 *         - Google ID Token 검증
 *         - 사용자 조회 또는 생성
 *         - 서버 전용 JWT 발급
 *
 *     2) verify_google_id_token()
 *         - Google 공개키(JWKS)를 이용해 RS256 서명 검증
 *         - aud(클라이언트 ID), iss(발급자) 검증
 *
 *     3) create_jwt()
 *         - 서버 전용 JWT 생성 (HS256)
 *
 *     4) decode_jwt()
 *         - 서버 전용 JWT 검증 및 Claims 반환
************************************************************************/

use axum::Json;
use chrono::{Duration, Utc};
use jsonwebtoken::{
    decode, decode_header, encode, Algorithm, DecodingKey, EncodingKey, Header, Validation,
};
use sqlx::PgPool;

use crate::{
    common::repository::{
        repository_user::{create_user, find_user_by_sub, update_last_login, update_user_name},
        repository_user_preference::create_default_preference,
    },
    config::env::get_env_value,
    domain::auth::dto::{
        dto_google_claims::GoogleClaims,
        dto_jwt::JwkResponse,
        dto_jwt_claims::JwtClaims,
        dto_req::GoogleLoginReq,
        dto_res::{GoogleLoginRes, UserRes},
    },
};

/// Google OAuth 로그인 전체 흐름을 처리한다.
/// 
/// # Arguments
/// * `pool`    - DB 커넥션 풀
/// * `req`     - GoogleLoginReq { id_token, client_id }
/// 
/// # Returns
/// * `Ok(Json<GoogleLoginRes>)`    - JWT + 사용자 정보
/// * `Err(String`                  - 오류 발생
pub async fn auth_google(
    pool: &PgPool,
    req: GoogleLoginReq,
) -> Result<Json<GoogleLoginRes>, String> {
    let claims = verify_google_id_token(req.id_token, req.client_id)
        .await
        .map_err(|e| format!("Google 검증 실패: {}", e))?;

    let user = match find_user_by_sub(pool, &claims.sub).await {
        Ok(mut existing_user) => {
            update_last_login(pool, &claims.sub).await?;
            existing_user.last_login = chrono::Utc::now().naive_utc();

            if existing_user.name != claims.name {
            update_user_name(pool, &claims.sub, &claims.name).await?;
            existing_user.name = claims.name.clone();
        }
            existing_user
        }
        Err(_) => {
            create_user(pool, &claims.sub, &claims.email, &claims.name).await?
        }
    };

    create_default_preference(pool, user.id).await?;

    let jwt = create_jwt(user.id.to_string(), user.email.clone())
        .map_err(|e| format!("JWT 생성 실패: {e}"))?;

    let response = GoogleLoginRes {
        jwt,
        user: UserRes {
            id: user.id,
            name: user.name,
            email: user.email,
            picture: claims.picture,
        },
    };

    Ok(Json(response))
}

/// Google Id Token(JWT)이 유효한지 검증한다(RS256).
/// 
/// # Arguments
/// * `id_token`    - Google에서 발급한 ID Token (JWT)
/// * `client_id`   - 우리 애플리케이션 전용 client_id
/// 
/// # Returns
/// * `Ok(GoogleClaims)`    - 사용자 정보 반환
/// * `Err(String)`         - 검증 실패
pub async fn verify_google_id_token(
    id_token: String,
    client_id: String,
) -> Result<GoogleClaims, String> {
    let header = decode_header(&id_token).map_err(|e| format!("헤더 파싱 실패: {}", e))?;
    let kid = header.kid.ok_or("헤더에 kid 없음")?;

    let resp = reqwest::get("https://www.googleapis.com/oauth2/v3/certs")
        .await
        .map_err(|e| format!("JWKS 요청 실패: {}", e))?;
    
    let jwks: JwkResponse = resp
        .json()
        .await
        .map_err(|e| format!("JWKS JSON 파싱 실패: {}", e))?;

    let jwk = jwks
        .keys
        .into_iter()
        .find(|key| key.kid == kid)
        .ok_or("일치하는 공개키 없음")?;

    let decoding_key = DecodingKey::from_rsa_components(&jwk.n, &jwk.e)
        .map_err(|e| format!("RSA 키 생성 실패: {}", e))?;

    let mut validation = Validation::new(Algorithm::RS256);
    validation.set_audience(&[client_id.as_str()]);
    validation.set_issuer(&["https://accounts.google.com"]);

    let decoded = decode::<GoogleClaims>(&id_token, &decoding_key, &validation)
        .map_err(|e| format!("ID Token 검증 실패: {}", e))?;

    Ok(decoded.claims)
}

/// 서버에서 사용하는 전용 JWT을 생성한다(HS256).
/// 
/// # Arguments
/// * `sub`     - 사용자 고유 ID (users 테이블의 id)
/// * `email`   - 사용자 이메일
/// 
/// # Returns
/// * `Ok(String)`  - 생성된 JWT 문자열
/// * `Err(String)` - JWT 생성 실패
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

/// 서버에서 발급한 JWT가 유효한지 검증하고 payload를 추출한다.
/// 
/// # Arguments
/// * `token`   - 클라이언트가 전달한 JWT 문자열
/// 
/// # Returns
/// * `Ok(JwtClaims)`   - 사용자 정보 반환
/// * `Err(String)`     - JWT 검증 실패
pub fn decode_jwt(token: &str) -> Result<JwtClaims, String> {
    let secret = get_env_value("JWT_SECRET");
    if secret.is_empty() {
        return Err("JWT_SUECRET이 설정되지 않았습니다".into());
    }

    let token_data = decode::<JwtClaims>(
        token,
        &DecodingKey::from_secret(secret.as_bytes()),
        &Validation::new(Algorithm::HS256),
    )
    .map_err(|e| format!("JWT 검증 실패: {}", e))?;

    Ok(token_data.claims)
}
