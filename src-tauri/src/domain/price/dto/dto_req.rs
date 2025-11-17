use serde::Deserialize;

/// 특정 상품의 가격 정보를 조회하기 위한 요청 DTO
/// 
/// # Fields
/// * `good_name` - 조회할 상품명
#[derive(Deserialize)]
pub struct PriceReq {
    pub good_name: String,
}