use serde::Serialize;

#[derive(Serialize)]
pub struct StoreRes {
    pub id: i32,
    pub store_id: String,
    pub store_name: String,
    pub tel_no: Option<String>,
    pub post_no: Option<String>,
    pub jibun_addr: String,
    pub road_addr: String,
    pub x_coord: Option<f64>,
    pub y_coord: Option<f64>,
    pub created_at: String,
    pub updated_at: String,
}