use serde::Deserialize;

// 한국소비자원 가격정보 API 응답 구조
#[derive(Debug, Deserialize)]
pub struct ApiResponse {
    #[serde(rename = "result")]
    pub result: ApiResult,
}

// <result> 내부 item 목록
#[derive(Debug, Deserialize)]
pub struct ApiResult {
    #[serde(rename = "iros.openapi.service.vo.goodPriceVO")]
    pub items: Vec<ApiItem>,
}

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