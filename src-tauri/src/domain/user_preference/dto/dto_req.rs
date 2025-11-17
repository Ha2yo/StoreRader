use serde::Deserialize;

/// 사용자 선호도 조회 요청 DTO
///
/// # Fields
/// * `token` - 클라이언트에서 전달받은 JWT
#[derive(Deserialize)]
pub struct PreferenceReq {
    pub token: String,
}
