use serde::Deserialize;

#[derive(Deserialize)]
pub struct PreferenceReq {
    pub token: String,
}