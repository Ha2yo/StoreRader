use serde::Deserialize;

/// 한국소비자원 '매장정보 API' 전체 응답 DTO
///
/// # Fields
/// * `result` - API 결과 본문
#[derive(Debug, Deserialize)]
pub struct ApiResponse {
    #[serde(rename = "result")]
    pub result: ApiResult,
}

/// 매장정보 API의 `<result>` 내부 구조
///
/// # Fields
/// * `items` - 매장 정보 리스트
#[derive(Debug, Deserialize)]
pub struct ApiResult {
    #[serde(rename = "iros.openapi.service.vo.entpInfoVO")]
    pub items: Vec<ApiItem>,
}

/// 매장정보 API의 개별 item DTO
/// 
/// # Fields
/// * `entp_id`             - 매장 ID
/// * `entp_name`           - 매장명
/// * `tel_no`              - 전화번호
/// * `post_no`             - 우편번호
/// * `jibun_addr`          - 지번 주소
/// * `road_addr`           - 도로명 주소
/// * `x_coord`             - 위도 좌표
/// * `y_coord`             - 경도 좌표
/// * `area_code`           - 지역 코드
/// * `area_detail_code`    - 지역 상세 코드
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
    pub jibun_addr: Option<String>,
    #[serde(rename = "roadAddrBasic")]
    pub road_addr: Option<String>,
    #[serde(rename = "xMapCoord")]
    pub x_coord: Option<f64>,
    #[serde(rename = "yMapCoord")]
    pub y_coord: Option<f64>,
    #[serde(rename = "entpAreaCode")]
    pub area_code: String,
    #[serde(rename = "areaDetailCode")]
    pub area_detail_code: String,
}