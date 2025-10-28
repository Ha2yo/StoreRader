use serde::Deserialize;

// 한국소비자원 매장정보 API 응답 구조
#[derive(Debug, Deserialize)]
pub struct ApiResponse {
    #[serde(rename = "result")]
    pub result: ApiResult,
}

// <result> 내부 item 목록
#[derive(Debug, Deserialize)]
pub struct ApiResult {
    #[serde(rename = "iros.openapi.service.vo.entpInfoVO")]
    pub items: Vec<ApiItem>,
}

// 실제 매장 단위 데이터 구조
#[derive(Debug, Deserialize)]
pub struct ApiItem {
    #[serde(rename = "entpId")]
    pub entp_id: String,
    #[serde(rename = "entpName")]
    pub entp_name: String,
    #[serde(rename = "entpTelno")]
    pub tel_no: Option<String>,
    #[serde(rename = "postNo")]
    pub post_no: Option<String>,
    #[serde(rename = "plmkAddrBasic")]
    pub plmk_addr: Option<String>,
    #[serde(rename = "roadAddrBasic")]
    pub road_addr: Option<String>,
    #[serde(rename = "xMapCoord")]
    pub x_coord: Option<f64>,
    #[serde(rename = "yMapCoord")]
    pub y_coord: Option<f64>,
}