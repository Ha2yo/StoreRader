use serde::Deserialize;

#[derive(Deserialize)]
pub struct InspectDayRes {
    pub inspect_day: String,
}