use chrono::NaiveDateTime;
use serde::Serialize;

/// 상품 정보 조회 시 반환되는 응답 DTO
/// 
/// # Fields
/// * `id`              - 내부 고유 PK
/// * `good_id`         - 공공데이터 기준 상품 ID
/// * `good_name`       - 상품명
/// * `total_cnt`       - 총 개수
/// * `total_div_code`  - 구분 코드
/// * `created_at`      - 생성 시각
/// * `updated_at`      - 수정 시각
#[derive(Serialize)]
pub struct GoodRes {
    pub id: i32,
    pub good_id: String,
    pub good_name: String,
    pub total_cnt: Option<i32>,
    pub total_div_code: Option<String>,
    pub created_at: NaiveDateTime,
    pub updated_at: NaiveDateTime,
}