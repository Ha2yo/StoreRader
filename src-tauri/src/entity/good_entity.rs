use chrono::{DateTime, Utc};
use sqlx::FromRow;

#[derive(Debug, FromRow, Clone)]
pub struct GoodEntity {
    pub id: i32,
    pub good_id: String,
    pub good_name: String,
    pub total_cnt: Option<i32>,
    pub total_div_code: Option<String>,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}
