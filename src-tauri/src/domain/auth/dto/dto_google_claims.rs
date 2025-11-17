use serde::Deserialize;

/// Google ID Token의 Payload 구조체이다.
/// 
/// # Fields
/// * `iss`             - 토큰 발급자
/// * `sub`             - Google 사용자 고유 ID
/// * `aud`             - 토큰 수신자
/// * `email`           - 사용자 이메일
/// * `email_verified`  - 이메일 인증 여부
/// * `exp`             - 만료 시각
/// * `iat`             - 발급 시각
/// * `name`            - 사용자 이름
/// * `picture`         - 프로필 이미지 URL
#[derive(Deserialize)]
pub struct GoogleClaims {
    pub iss: String,
    pub sub: String,
    pub aud: String,
    pub email: String,
    pub email_verified: bool,
    pub exp: usize,
    pub iat: usize,
    pub name: String,
    pub picture: String,
}