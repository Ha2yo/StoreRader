use serde::Deserialize;

/// 한국소비자원 '지역코드 API' 전체 응답 DTO
///
/// # Fields
/// * `result` - API 결과 본문
#[derive(Debug, Deserialize)]
pub struct ApiResponse {
    #[serde(rename = "result")]
    pub result: ApiResult,
}

/// 지역코드 API의 `<result>` 내부 구조
///
/// # Fields
/// * `items` - 지역 코드 리스트
#[derive(Debug, Deserialize)]
pub struct ApiResult {
    #[serde(rename = "iros.openapi.service.vo.stdInfoVO")]
    pub items: Vec<ApiItem>,
}

/// 지역코드 API의 개별 item DTO
/// 
/// # Fields
/// * `code`        - 지역 코드
/// * `code_name`   - 지역명
/// * `high_code`   - 상위 지역 코드
#[derive(Debug, Deserialize)]
pub struct ApiItem {
    #[serde(rename = "code")]
    pub code: String,
    #[serde(rename = "codeName")]
    pub code_name: String,
    #[serde(rename = "highCode")]
    pub high_code: String,
}