use serde::{Deserialize, Serialize};

/// 서버가 발급하는 JWT의 Claim 구조이다.
/// 
/// # Fields
/// * `sub`     - 사용자 고유 ID (user 테이블의 id 값)
/// * `email`   - 사용자 이메일
/// * `exp`     - 만료 시각
#[derive(Serialize, Deserialize)]
pub struct JwtClaims {
    pub sub: String,
    pub email: String,
    pub exp: usize,
}
