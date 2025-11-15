use serde::Deserialize;

#[derive(Deserialize)]
pub struct InspectDayReq {
    pub inspect_day: String,
}

#[derive(Deserialize)]
pub struct PriceChangeReq {
    pub inspect_day: String,
}