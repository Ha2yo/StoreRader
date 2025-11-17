use serde::Serialize;
use sqlx::prelude::FromRow;

/// 특정 상품의 매장별 가격 정보 조회 시 반환되는 응답 DTO
/// 
/// # Fields
/// * `store_id`    - 매장 ID
/// * `price`       - 해당 조사일의 가격
/// * `inspect_day` - 가격 조사일 (YYYYMMDD)
#[derive(Serialize, FromRow)]
pub struct PriceRes {
    pub store_id: String,
    pub price: i32,
    pub inspect_day: String,
}