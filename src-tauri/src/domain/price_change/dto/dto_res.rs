use serde::Serialize;
use sqlx::prelude::FromRow;

#[derive(Serialize, FromRow)]

pub struct PriceTrendRes {
    pub good_id: String,
    pub good_name: String,
    pub avg_drop: i32,
    pub min_drop: i32,
    pub max_drop: i32,
    pub change_count: i64,
    pub inspect_day: String,
}
