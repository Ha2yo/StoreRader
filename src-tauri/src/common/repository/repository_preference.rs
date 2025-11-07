use sqlx::PgPool;

pub async fn create_default_preference(pool: &PgPool, user_id: i32) -> Result<(), String> {
    sqlx::query(
        "INSERT INTO preferences (id, w_distance, w_price)
        VALUES ($1, 0.5, 0.5)
        ON CONFLICT (id) DO NOTHING",
    )
    .bind(user_id)
    .execute(pool)
    .await
    .map_err(|e| format!("신규 유저 생성 실패: {}", e))?;

    Ok(())
}