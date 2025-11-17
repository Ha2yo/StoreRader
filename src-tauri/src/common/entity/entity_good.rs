use chrono::NaiveDateTime;
use sqlx::FromRow;

#[derive(Debug, FromRow)]
pub struct GoodEntity {
    pub id: i32,
    pub good_id: String,
    pub good_name: String,
    pub total_cnt: Option<i32>,
    pub total_div_code: Option<String>,
    pub created_at: NaiveDateTime,
    pub updated_at: NaiveDateTime,
}
