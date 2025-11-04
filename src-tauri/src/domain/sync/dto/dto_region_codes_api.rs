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
    #[serde(rename = "iros.openapi.service.vo.stdInfoVO")]
    pub items: Vec<ApiItem>,
}

#[derive(Debug, Deserialize)]
pub struct ApiItem {
    #[serde(rename = "code")]
    pub code: String,
    #[serde(rename = "codeName")]
    pub code_name: String,
    #[serde(rename = "highCode")]
    pub high_code: String,
}