use chrono::NaiveDateTime;
use sqlx::prelude::FromRow;

#[derive(Debug, FromRow)]
pub struct UserEntity {
    pub id: i32,
    pub sub: String,
    pub email: String,
    pub name: String,
    pub created_at: NaiveDateTime,
    pub last_login: NaiveDateTime,
}