use chrono::NaiveDateTime;
use sqlx::FromRow;

#[derive(Debug, FromRow)]
pub struct PriceEntity {
    pub id: i32,
    pub good_id: String,
    pub store_id: String,
    pub inspect_day: String,
    pub price: i32,
    pub is_one_plus_one: String,
    pub is_discount: String,
    pub discount_start: Option<String>,
    pub discount_end: Option<String>,
    pub created_at: NaiveDateTime,
}