use serde::Deserialize;

#[derive(Deserialize)]
pub struct PriceReq {
    pub good_name: String,
}