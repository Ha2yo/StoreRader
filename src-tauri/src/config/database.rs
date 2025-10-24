use sqlx::postgres::PgPoolOptions;

use crate::config::env::get_env_value;

#[derive(Clone)]
pub struct PgPoolWrapper {
    pub pool: sqlx::PgPool,
}

pub async fn connect_db() -> sqlx::PgPool {
    // 환경 변수에서 DB URL 읽기
    let db_url: String = get_env_value("DATABASE_URL");

    // 풀 생성
    let pool = PgPoolOptions::new()
        .max_connections(10)
        .connect(&db_url)
        .await
        .expect("데이터베이스 연결에 실패했습니다. DATABASE_URL 또는 네트워크 설정을 확인하세요.");
    
    tracing::info!("Database has been connected");
    pool
}