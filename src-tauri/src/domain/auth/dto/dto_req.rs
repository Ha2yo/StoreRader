use serde::Deserialize;

/// Google OAuth 로그인 요청 DTO
/// 
/// # Fields
/// * `id_token`  - Google이 발급한 사용자 ID Token (JWT)
/// * `client_id` - Google Cloud Console에서 발급받은 이 애플리케이션의 Client ID
#[derive(Deserialize)]
pub struct GoogleLoginReq {
    pub id_token: String,
    pub client_id: String,
}