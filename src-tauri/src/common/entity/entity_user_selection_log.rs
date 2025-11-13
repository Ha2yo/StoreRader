use chrono::NaiveDateTime;
use sqlx::prelude::FromRow;

#[derive(Debug, FromRow, Clone)]
pub struct UserSelectionLogEntity {
    pub id: i32,
    pub user_id: i32,
    pub store_id: String,
    pub good_id: String,
    pub preference_type: String,
    pub created_at: NaiveDateTime,
    pub price: i32,
}
