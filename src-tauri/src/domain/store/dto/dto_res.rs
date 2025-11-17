use serde::Serialize;

/// 매장 정보 조회 시 반환되는 응답 DTO
/// 
/// # Fields
/// * `id`                  - 내부 고유 PK
/// * `store_id`            - 공공데이터 기준 매장 ID
/// * `store_name`          - 매장명
/// * `tel_no`              - 전화번호
/// * `post_no`             - 우편번호
/// * `jibun_addr`          - 지번 주소
/// * `road_addr`           - 도로명 주소
/// * `x_coord`             - 위도 값
/// * `y_coord`             - 경도 값
/// * `created_at`          - 생성 시각
/// * `updated_at`          - 수정 시각
/// * `area_code`           - 행정구역 코드
/// * `area_detail_code`    - 세부 행정구역 코드
#[derive(Serialize)]
pub struct StoreRes {
    pub id: i32,
    pub store_id: String,
    pub store_name: String,
    pub tel_no: Option<String>,
    pub post_no: Option<String>,
    pub jibun_addr: String,
    pub road_addr: String,
    pub x_coord: Option<f64>,
    pub y_coord: Option<f64>,
    pub created_at: String,
    pub updated_at: String,
    pub area_code: String,
    pub area_detail_code: String,
}