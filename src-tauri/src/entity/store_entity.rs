use chrono::{DateTime, Utc};
use sqlx::FromRow;

// StoreEntity — stores 테이블의 한 행(Row)을 표현
#[derive(Debug, FromRow, Clone)]
pub struct StoreEntity {
    pub id: i32,
    pub store_id: String,
    pub store_name: String,
    pub tel_no: Option<String>,
    pub post_no: Option<String>,
    pub plmk_addr: String,
    pub road_addr: String,
    pub x_coord: Option<f64>,
    pub y_coord: Option<f64>,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}
