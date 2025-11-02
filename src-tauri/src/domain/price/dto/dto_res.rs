use serde::Serialize;
use sqlx::prelude::FromRow;

#[derive(Serialize, FromRow)]
pub struct PriceRes {
    pub store_id: String,
    pub price: i32,
    pub inspect_day: String,
}