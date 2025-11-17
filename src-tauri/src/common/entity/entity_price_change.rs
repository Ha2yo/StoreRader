use chrono::NaiveDateTime;
use sqlx::FromRow;

#[derive(Debug, FromRow)]
pub struct PriceChangeEntity {
    pub id: i32,
    pub good_id: String,
    pub store_id: String,
    pub previous_price: i32,
    pub current_price: i32,
    pub diff: i32,
    pub inspect_day: String,
    pub created_at: NaiveDateTime,
}