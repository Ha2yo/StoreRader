/***********************************************************
 service.rs는 인증 관련 로직을 처리한다
 
 [어떻게 진행되는지]

 1) 구글 로그인 이벤트가 발생하면, 
    서버로 Google ID Token을 전송한다

 2) 서버는 구글 토큰이 진짜인지를 검증한다
    - 토큰의 서명이 구글이 맞는지
    - 만료가 되지는 않았는지
    - 우리 앱용 토큰이 맞는지
    - 이 단계에서 유저 정보(sub, email 등)를 얻을 수 있다

 3) DB에서 유저 탐색 및 생성
    - sub를 기준으로 users 테이블을 조회한다
    - 이미 있으면 last_login만 갱신
    - 없으면 새로 생성한다
 
 4) 서버 전용 JWT 발급
    - 유저 id / email을 담은 JWT를 새로 만들어서
      세션 토큰을 발급한다

 5) 클라이언트로 반환
    - { jwt, user { id, name, email }} 형태로 반환



 [주요 함수]

 1. auth_google()
    - ID Token 검증 -> DB 조회 / 생성
      -> JWT 발급 -> JWT 반환
    
 2. verify_google_id_token()
    - Google의 공개키(JWKS)로 ID Token 검증

 3. create_jwt()
    - 서버 자체 JWT 생성
 ***********************************************************/

use axum::Json;
use chrono::{Duration, Utc};
use jsonwebtoken::{
    decode, decode_header, encode, Algorithm, DecodingKey, EncodingKey, Header, Validation,
};
use serde::{Deserialize, Serialize};
use sqlx::PgPool;

use crate::{common::repository::{repository_preference::create_default_preference, repository_user::find_and_create_user}, config::env::get_env_value, domain::auth::dto::{dto_req::GoogleLoginReq, dto_res::{GoogleLoginRes, UserRes}}};


// Google ID Token Claims 구조체
// verify_google_id_token()에서 토큰 해독 후 사용자 정보 추출 시 사용
#[derive(Serialize, Deserialize)]
pub struct GoogleClaims {
    pub iss: String,          // 발급자
    pub sub: String,          // 고유 식별자
    pub aud: String,          // 수신자 (clientId)
    pub email: String,        // 유저 이메일
    pub email_verified: bool, // 이메일 인증 여부
    pub exp: usize,           // 만료 시각
    pub iat: usize,           // 발급 시각
    pub name: String,         // 유저 이름
    pub picture: String,      // 프로필 사진 URL
}

// 구글의 JWKS(공개키 세트)중 개별 공개키 정보
// verify_google_id_token()에서 토큰의 서명 검증용 RSA 키 생성 시 활용
#[derive(Deserialize)]
struct Jwk {
    kid: String, // Key ID
    n: String,
    e: String,
}

// 구글 JWKS 응답 전체 구조
// 여러 JWK를 포함하며, RS256 검증 시 kid 매칭을 위해 사용
#[derive(Deserialize)]
struct JwkResponse {
    keys: Vec<Jwk>,
}

// 서버 전용 JWT Claims 구조체
// create_jwt(), decode_jwt()에서 아용된다
#[derive(Serialize, Deserialize)]
pub struct JwtClaims {
    pub sub: String,    // 사용자 고유 ID (user 테이블의 id 값)
    pub email: String,
    pub exp: usize,     // 만료 시각
}



// auth_google()
// 기능: Google 로그인 전체 처리
// 입력: pool(DB 연결), req(GoogleLoginReq { id_token, client_id })
// 출력: Result<Json<GoogleLoginRes { jwt, user{id,name,email} }>, String(에러 메시지)>
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
    create_default_preference(&pool, user.id).await?;
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



// verify_google_id_token()
// 기능: Google에서 발급한 Id Token이 유효한지 검증
// 입력: id_token, client_id
// 출력: Result<GoogleClaims { sub, email, name, ... }, String(에러 메시지)>
pub async fn verify_google_id_token(
    id_token: String,
    client_id: String,
) -> Result<GoogleClaims, String> {
    // ID Token의 헤더에서 서명에 사용된 키 (kid) 추출
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

    // ID Token 검증 및 해독
    let decoded = decode::<GoogleClaims>(&id_token, &decoding_key, &validation)
        .map_err(|e| format!("ID Token 검증 실패: {}", e))?;

    Ok(decoded.claims)
}



// create_jwt()
// 기능: 서버 전용 JWT 발급
// 입력: sub, email
// 출력: Result<String(JWT 토큰), String(에러 메시지)>
pub fn create_jwt(sub: String, email: String) -> Result<String, String> {
    // 만료 시간 설정 (24시간)
    let exp = (Utc::now() + Duration::hours(24)).timestamp() as usize;

    // JWT 페이로드 생성
    let claims = JwtClaims { sub, email, exp };

    // .env 파일에서 JWT_SECRET 값 가져오기
    let secret = get_env_value("JWT_SECRET");
    if secret.is_empty() {
        return Err("JWT_SECRET이 설정되지 않았습니다".into());
    }

    // HS256 알고리즘으로 JWT 서명 및 인코딩
    let token = encode(
        &Header::default(),
        &claims,
        &EncodingKey::from_secret(secret.as_bytes()),
    )
    .map_err(|e| format!("JWT 생성 실패: {e}"))?;

    Ok(token)
}



// decode_jwt()
// 기능: 서버에서 발급한 JWT 검증 및 디코딩
// 입력: token(클라이언트가 보낸 JWT 문자열)
// 출력: Result<JwtClaims { sub, email, exp }, String(에러 메시지)>
pub fn decode_jwt(token: &str) -> Result<JwtClaims, String> {
    // .env 파일에서 JWT 서명용 비밀키 로드
    let secret = get_env_value("JWT_SECRET");
    if secret.is_empty() {
        return Err("JWT_SUECRET이 설정되지 않았습니다".into());
    }

    // HS256 알고리즘으로 JWT 복호화 및 검증 수행
    let token_data = decode::<JwtClaims>(
        token,
        &DecodingKey::from_secret(secret.as_bytes()),
        &Validation::new(Algorithm::HS256),
    )
    .map_err(|e| format!("JWT 검증 실패: {}", e))?;

    Ok(token_data.claims)
}
