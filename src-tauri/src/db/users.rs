use chrono::NaiveDateTime;
use serde::{Deserialize, Serialize};
use sqlx::FromRow;
use tauri::State;
use sqlx::Error;

use crate::db::connect::PgPoolWrapper;

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

pub async fn find_and_create_user(
    state: State<'_, PgPoolWrapper>,
    sub: &str,
    email: &str,
    name: &str,
) -> Result<User, String> {
    let pool = &state.pool;

    // 기존 유저 조회
    match sqlx::query_as::<_, User>("SELECT * FROM users WHERE sub = $1")
        .bind(sub)
        .fetch_one(pool)
        .await
    {
        Ok(mut user) => {
            // 로그인 시간 업데이트
            sqlx::query("UPDATE users SET last_login = NOW() WHERE sub = $1")
                .bind(sub)
                .execute(pool)
                .await
                .map_err(|e| format!("last_login 업데이트 실패: {}", e))?;

            user.last_login = chrono::Utc::now().naive_utc();
            return Ok(user);
        }
        Err(Error::RowNotFound) => {
            // 계속 진행: 신규 생성
        }
        Err(e) => {
            return Err(format!("DB 조회 실패: {}", e));
        }
    }

    // 신규 유저 생성
    let new_user = sqlx::query_as::<_, User>(
        "INSERT INTO users (sub, email, name) VALUES ($1, $2, $3)
         RETURNING id, sub, email, name, created_at, last_login",
    )
    .bind(sub)
    .bind(email)
    .bind(name)
    .fetch_one(pool)
    .await
    .map_err(|e| format!("신규 유저 생성 실패: {}", e))?;

    Ok(new_user)
}