use serde::Serialize;
use sqlx::prelude::FromRow;

/// 가격 변동 분석 결과를 반환하는 응답 DTO
/// 
/// # Fields
/// * `good_id`         - 상품 ID
/// * `good_name`       - 상품명
/// * `avg_drop`        - 평균 가격 변화량
/// * `min_drop`        - 최소 변화값
/// * `max_drop`        - 최대 변화값
/// * `change_count`    - 변화 데이터 개수
/// * `inspect_day`     - 기준 조사일(YYYYMMDD)
#[derive(Serialize, FromRow)]
pub struct PriceTrendRes {
    pub good_id: String,
    pub good_name: String,
    pub avg_drop: i32,
    pub min_drop: i32,
    pub max_drop: i32,
    pub change_count: i64,
    pub inspect_day: String,
}
