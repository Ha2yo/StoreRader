use serde::Deserialize;

/// 특정 상품에 대한 매장 조회 요청 DTO
/// 
/// # Fields
/// * `good_id` - 조회할 상품의 ID
#[derive(Deserialize)]
pub struct GoodIdReq {
    pub good_id: i32,
}