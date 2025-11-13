#[derive(serde::Deserialize)]
pub struct UserSelectionLogReq {
    pub store_id: String,
    pub good_id: String,
    pub price: i32,
    pub preference_type: String,
}
