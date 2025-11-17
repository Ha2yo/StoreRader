use serde::Deserialize;

/// 가격 변동 데이터 요청 DTO
/// 
/// # Fields
/// * `inspect_day` - 기준 조사일(YYYYMMDD)
#[derive(Deserialize)]
pub struct PriceChangeReq {
    pub inspect_day: String,
}

/// 가격 변동 추이(상승/하락)을 조회하기 위한 요청 DTO
/// 
/// # Fields
/// * `status` - 조회 타입 ("up" 또는 "down")
#[derive(Deserialize)]
pub struct PriceTrendReq {
    pub status: String,
}
