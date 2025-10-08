use crate::db::connect::connect_db;
use chrono::NaiveDateTime;
use serde::{Deserialize, Serialize};
use sqlx::postgres::PgPool;
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
pub async fn print_all_users() {
    // DB 연결 (값 타입 PgPool 반환)
    let pool: PgPool = connect_db().await.unwrap();

    // users 테이블 조회
    let recs: Vec<User> = sqlx::query_as::<_, User>("SELECT * FROM users")
        .fetch_all(&pool)
        .await
        .unwrap();

    // 터미널 출력
    println!("==== 전체 유저 목록 ====");
    for user in recs {
        println!(
            "id: {}, email: {}, name: {}, google_id: {}",
            user.id, user.email, user.name, user.google_id
        );
    }
}
