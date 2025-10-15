use chrono::{Duration, Utc};
use jsonwebtoken::{decode, encode, Algorithm, DecodingKey, EncodingKey, Header, Validation};
use serde::{Deserialize, Serialize};

use crate::env::get_env_value;

#[derive(Serialize, Deserialize)]
pub struct JwtClaims {
    pub sub: String,    // 고유 ID (user 테이블의 id 값)
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
        &Validation::new(Algorithm::HS256)
    )
    .map_err(|e| format!("JWT 검증 실패: {}", e))?;

    Ok(token_data.claims)
}