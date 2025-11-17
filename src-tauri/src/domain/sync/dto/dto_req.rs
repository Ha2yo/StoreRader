use serde::Deserialize;

/// 가격 데이터 조회 요청 DTO
/// 
/// # Fields
/// * `inspect_day` - 조회할 조사일 (YYYYMMDD)
#[derive(Deserialize)]
pub struct InspectDayReq {
    pub inspect_day: String,
}
