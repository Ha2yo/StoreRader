use chrono::{Duration, Utc};
use jsonwebtoken::{encode, EncodingKey, Header};
use serde::{Deserialize, Serialize};

use crate::env::get_env_value;

#[derive(Serialize, Deserialize)]
struct jwtClaims {
    sub: String,    // 고유 ID (user 테이블의 id 값)
    email: String,
    exp: usize,
}

pub fn create_jwt(sub: String, email: String) -> Result<String, String> {

    let exp = (Utc::now() + Duration::hours(24)).timestamp() as usize;

    let claims = jwtClaims { sub, email, exp };

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