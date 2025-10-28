use serde::Deserialize;

// 한국소비자원 상품정보 API 응답 구조
#[derive(Debug, Deserialize)]
pub struct ApiResponse {
    #[serde(rename = "result")]
    pub result: ApiResult
}

// <result> 내부 item 목록
#[derive(Debug, Deserialize)]
pub struct ApiResult {
    #[serde(rename = "item")]
    pub items: Vec<ApiItem>,
}

// 실제 상품 단위 데이터 구조
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