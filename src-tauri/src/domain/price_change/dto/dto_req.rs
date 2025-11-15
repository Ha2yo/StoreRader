use serde::Deserialize;

#[derive(Deserialize)]
pub struct PriceTrendReq {
    pub status: String,
}