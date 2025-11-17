/************************************************************************
 * File: config/database.rs
 * Description:
 *     PostgreSQL 데이터베이스 연결 및 커넥션 풀 생성을 담당한다.
 *
 * Reponsibilities:
 *     1) PgPoolWrapper
 *         - PgPool을 감싸 여러 곳에서 공유 가능하도록 관리
 *
 *     2) connect_db()
 *         - DATABASE_URL 환경 변수로부터 DB 접속 정보를 불러온 뒤
 *           PostgreSQL 커넥션 풀을 생성 및 반환한다
************************************************************************/

use crate::config::env::get_env_value;
use sqlx::postgres::PgPoolOptions;

#[derive(Clone)]
pub struct PgPoolWrapper {
    pub pool: sqlx::PgPool,
}

/// PostgreSQL 커넥션 풀을 생성해 반환한다.
pub async fn connect_db() -> sqlx::PgPool {
    let db_url: String = get_env_value("DATABASE_URL");

    let pool = PgPoolOptions::new()
        .max_connections(10)
        .connect(&db_url)
        .await
        .expect("데이터베이스 연결에 실패했습니다. DATABASE_URL 또는 네트워크 설정을 확인하세요.");

    tracing::info!("데이터베이스 연결 완료");
    pool
}
