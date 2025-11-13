use chrono::NaiveDateTime;
use serde::Serialize;
use sqlx::prelude::FromRow;

#[derive(Serialize, FromRow)]
pub struct UserSelectionLogRes {
    pub id: i32,
    pub store_id: String,
    pub store_name: String,
    pub good_id: String,
    pub good_name: String,
    pub price: i32,
    pub current_price: i32,
    pub x_coord: Option<f64>,
    pub y_coord: Option<f64>,
    pub created_at: NaiveDateTime,
}