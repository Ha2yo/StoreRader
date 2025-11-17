use serde::Serialize;

/// 지역 코드 조회 시 반환되는 응답 DTO
/// 
/// # Fields
/// * `code`        - 행정구역 코드
/// * `name`        - 행정구역 명칭
/// * `parent_code` - 상위 행정구역 코드
/// * `level`       - 행정구역 단계
#[derive(Serialize)]
pub struct RegionCodeRes {
    pub code: String,
    pub name: String,
    pub parent_code: Option<String>,
    pub level: i16,
}