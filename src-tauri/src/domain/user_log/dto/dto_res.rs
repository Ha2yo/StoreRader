use chrono::NaiveDateTime;
use serde::Serialize;
use sqlx::prelude::FromRow;

/// 매장 선택 기록 조회 응답 DTO
/// 
/// # Fields
/// * `id`              - 고유 ID
/// * `store_id`        - 선택한 매장 ID
/// * `store_name`      - 선택한 매장의 이름
/// * `good_id`         - 선택한 상품 ID
/// * `good_name`       - 선택한 상품명
/// * `price`           - 사용자가 선택할 당시의 상품 가격
/// * `current_price`   - 현재 기준 최신 상품 가격
/// * `x_coord`         - 위도 좌표
/// * `y_coord`         - 경도 좌표
/// * `created_at`      - 사용자가 매장을 선택한 시각
#[derive(Serialize, FromRow)]
pub struct UserSelectionLogRes {
    pub id: i32,
    pub store_id: String,
    pub store_name: String,
    pub good_id: String,
    pub good_name: String,
    pub price: i32,
    pub current_price: i32,
    pub x_coord: Option<f64>,
    pub y_coord: Option<f64>,
    pub created_at: NaiveDateTime,
}
