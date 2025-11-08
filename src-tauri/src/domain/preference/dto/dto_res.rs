use serde::Serialize;

#[derive(Serialize)]
pub struct PreferenceRes {
    pub w_price: f64,
    pub w_distance: f64,
}