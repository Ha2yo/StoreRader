use sqlx::PgPool;

use crate::common::entity::entity_preference::PreferenceEntity;

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

pub async fn get_preference_by_user_id(pool: &PgPool, user_id: i32) -> Result<PreferenceEntity, sqlx::Error> {
    sqlx::query_as::<_, PreferenceEntity>("SELECT * FROM preferences WHERE id = $1")
        .bind(user_id)
        .fetch_one(pool)
        .await
}