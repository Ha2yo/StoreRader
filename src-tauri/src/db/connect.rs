use sqlx::postgres::PgPoolOptions;
use crate::get_env::get_env;

pub async fn connect_db() -> Result<sqlx::PgPool, sqlx::Error> {
    // 환경변수 생성
    let db_url = get_env("DATABASE_URL");

    // 연결 풀 생성
    let pool = PgPoolOptions::new().connect(&db_url).await.map_err(|e| {
        tracing::error!("Failed to connect to the database: {}", e);
        e
    })?;

    eprintln!("DB 연결 성공!");

    Ok(pool)
}
