use serde::Serialize;

/// 사용자 가중치 응답 DTO
/// 
/// # Fields
/// * `w_price`     - 가격 가중치
/// * `w_distance`  - 거리 가중치
#[derive(Serialize)]
pub struct PreferenceRes {
    pub w_price: f64,
    pub w_distance: f64,
}

#[derive(Serialize)]
pub struct ThresholdRes {
    pub threshold: f64,
}