use serde::Deserialize;

/// 사용자가 매장을 선택했을 때 서버로 전달되는 요청 DTO
/// 
/// # Fields
/// * `store_id`        - 선택한 매장의 ID
/// * `good_id`         - 선택한 상품의 ID
/// * `price`           - 선택 당시의 상품 가격
/// * `preference_type` - 사용자의 선택 경향 ("price" | "distance")
#[derive(Deserialize)]
pub struct UserSelectionLogReq {
    pub store_id: String,
    pub good_id: String,
    pub price: i32,
    pub preference_type: String,
}
