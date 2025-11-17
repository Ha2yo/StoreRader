use chrono::NaiveDateTime;
use sqlx::prelude::FromRow;

#[derive(Debug, FromRow)]
pub struct PreferenceEntity {
    pub id: i32,
    pub w_distance: f64,
    pub w_price: f64,
    pub updated_at: NaiveDateTime,
}
