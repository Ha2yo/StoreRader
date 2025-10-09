use crate::db::connect::PgPoolWrapper;
use tauri::State;
use chrono::NaiveDateTime;
use serde::{Deserialize, Serialize};
use sqlx::FromRow;

#[derive(Debug, Serialize, Deserialize, FromRow)]
struct User {
    id: i32,
    google_id: String,
    email: String,
    name: String,
    created_at: NaiveDateTime, // DateTime<Utc> -> NaiveDateTime
    last_login: NaiveDateTime, // DateTime<Utc> -> NaiveDateTime
}

#[tauri::command]
pub async fn print_all_users(state: State<'_, PgPoolWrapper>) -> Result<(), String> {
    // 전역 상태로 등록된 DB 풀 가져오기
    let pool = &state.pool;

    // users 테이블 전체 조회
    let recs: Vec<User> = sqlx::query_as::<_, User>("SELECT * FROM users")
        .fetch_all(pool)
        .await
        .map_err(|e| format!("users 조회 실패: {}", e))?;

    // 터미널 출력
    println!("==== 전체 유저 목록 ====");
    for user in recs {
        println!(
            "id: {}, email: {}, name: {}, google_id: {}",
            user.id, user.email, user.name, user.google_id
        );
    }

    Ok(())
}