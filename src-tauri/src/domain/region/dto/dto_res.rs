use serde::Serialize;

#[derive(Serialize)]
pub struct RegionCodeRes {
    pub code: String,
    pub name: String,
    pub parent_code: Option<String>,
    pub level: i16,
}