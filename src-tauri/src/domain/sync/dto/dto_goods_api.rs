use serde::Deserialize;

/// 한국소비자원 '상품정보 API' 전체 응답 DTO
///
/// # Fields
/// * `result` - API 결과 본문
#[derive(Debug, Deserialize)]
pub struct ApiResponse {
    #[serde(rename = "result")]
    pub result: ApiResult,
}

/// 상품정보 API의 `<result>` 내부 구조
///
/// # Fields
/// * `items` - 상품 정보 리스트
#[derive(Debug, Deserialize)]
pub struct ApiResult {
    #[serde(rename = "item")]
    pub items: Vec<ApiItem>,
}

/// 상품정보 API의 개별 item DTO
///
/// # Fields
/// * `good_id`             - 상품 ID
/// * `good_name`           - 상품명
/// * `good_total_cnt`      - 총 개수
/// * `good_total_div_code` - 구분 코드
#[derive(Debug, Deserialize)]
pub struct ApiItem {
    #[serde(rename = "goodId")]
    pub good_id: String,
    #[serde(rename = "goodName")]
    pub good_name: String,
    #[serde(rename = "goodTotalCnt")]
    pub good_total_cnt: Option<String>,
    #[serde(rename = "goodTotalDivCode")]
    pub good_total_div_code: Option<String>,
}
