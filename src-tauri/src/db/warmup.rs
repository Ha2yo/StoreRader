use sqlx::PgPool;

pub async fn warmup_db(pool: &PgPool) {
    println!("DB 활성화 중..");

    // 첫 연결 딜레이를 미리 소비
    match sqlx::query("SELECT 1").execute(pool).await {
        Ok(_) => println!("DB 활성화 완료"),
        Err(e) => eprintln!("DB 활성화 실패: {}", e),
    }
}
