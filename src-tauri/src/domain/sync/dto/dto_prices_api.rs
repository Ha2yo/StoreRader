use serde::Deserialize;

/// 한국소비자원 '가격정보 API' 전체 응답 DTO
///
/// # Fields
/// * `result` - API 결과 본문
#[derive(Debug, Deserialize)]
pub struct ApiResponse {
    #[serde(rename = "result")]
    pub result: ApiResult,
}

/// 가격정보 API의 `<result>` 내부 구조
///
/// # Fields
/// * `items` - 가격 정보 리스트
#[derive(Debug, Deserialize)]
pub struct ApiResult {
    #[serde(rename = "iros.openapi.service.vo.goodPriceVO")]
    pub items: Vec<ApiItem>,
}

/// 가격정보 API의 개별 item DTO
/// 
/// # Fields
/// * `good_inspect_day`    - 조사일자(YYYYMMDD)
/// * `entp_id`             - 매장 ID
/// * `good_id`             - 상품 ID
/// * `good_price`          - 가격
/// * `plus_one_yn`         - 1+1 여부 (Y/N)
/// * `good_dc_yn`          - 할인 여부 (Y/N)
/// * `good_dc_start_day`   - 할인 시작일
/// * `good_dc_end_day`     - 할인 종료일
#[derive(Debug, Deserialize)]
pub struct ApiItem {
    #[serde(rename = "goodInspectDay")]
    pub good_inspect_day: String,
    #[serde(rename = "entpId")]
    pub entp_id: String,
    #[serde(rename = "goodId")]
    pub good_id: String,
    #[serde(rename = "goodPrice")]
    pub good_price: String,
    #[serde(rename = "plusoneYn")]
    pub plus_one_yn: Option<String>,
    #[serde(rename = "goodDcYn")]
    pub good_dc_yn: Option<String>,
    #[serde(rename = "goodDcStartDay")]
    pub good_dc_start_day: Option<String>,
    #[serde(rename = "goodDcEndDay")]
    pub good_dc_end_day: Option<String>,
}
