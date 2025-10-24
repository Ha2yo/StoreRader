use chrono::NaiveDateTime;
use serde::{Deserialize, Serialize};
use sqlx::prelude::FromRow;

#[derive(Serialize, Deserialize, FromRow)]
pub struct User {
    pub id: i32,
    pub sub: String,
    pub email: String,
    pub name: String,
    pub created_at: NaiveDateTime,
    pub last_login: NaiveDateTime,
}

#[derive(Serialize)]
pub struct SimpleUser {
    pub name: String,
    pub email: String,
}