use chrono::NaiveDateTime;
use sqlx::FromRow;

#[derive(Debug, FromRow, Clone)]
pub struct StoreEntity {
    pub id: i32,
    pub store_id: String,
    pub store_name: String,
    pub tel_no: Option<String>,
    pub post_no: Option<String>,
    pub jibun_addr: String,
    pub road_addr: String,
    pub x_coord: Option<f64>,
    pub y_coord: Option<f64>,
    pub created_at: NaiveDateTime,  
    pub updated_at: NaiveDateTime,
    pub area_code: String,
    pub area_detail_code: String,
}
