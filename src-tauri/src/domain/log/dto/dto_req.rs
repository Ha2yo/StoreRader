#[derive(serde::Deserialize)]
pub struct UserSelectionLogReq {
    pub store_id: String,
    pub good_id: String,
    pub preference_type: String,
}
