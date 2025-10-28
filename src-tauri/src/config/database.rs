/***********************************************************
 database.rs는 PostgreSQL 데이터베이스 연결 및
 풀 관리를 담당한다

 환경 변수에서 DB 접속 URL을 읽어 연결을 생선한다
 그 후, SQLX의 PgPool을 사용하여 커넥션 풀을 관리한다

 1. PgPoolWrapper
    - sqlx:PgPool을 감싸 공유 가능하게 관리한다

 2. connect_db()
    - PostgreSQL 풀을 생성하고 연결한다
 **********************************************************/

use sqlx::postgres::PgPoolOptions;
use crate::config::env::get_env_value;

#[derive(Clone)]
pub struct PgPoolWrapper {
    pub pool: sqlx::PgPool,
}

// connect_db()
// 기능: PostgreSQL 풀 생성 및 연결
// 입력: X
// 출력: 성공 시 sqlx::PgPool, 실패 시 panic
pub async fn connect_db() -> sqlx::PgPool {
    // 환경 변수에서 DB URL 읽기
    let db_url: String = get_env_value("DATABASE_URL");

    // 풀 생성
    let pool = PgPoolOptions::new()
        .max_connections(10)
        .connect(&db_url)
        .await
        .expect("데이터베이스 연결에 실패했습니다. DATABASE_URL 또는 네트워크 설정을 확인하세요.");

    tracing::info!("데이터베이스 연결 완료");
    pool
}