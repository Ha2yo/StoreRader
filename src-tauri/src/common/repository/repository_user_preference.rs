use sqlx::PgPool;

use crate::common::entity::entity_user_preference::PreferenceEntity;

pub async fn create_default_preference(pool: &PgPool, user_id: i32) -> Result<(), String> {
    sqlx::query(
        "INSERT INTO user_preferences (id, w_distance, w_price)
        VALUES ($1, 0.5, 0.5)
        ON CONFLICT (id) DO NOTHING",
    )
    .bind(user_id)
    .execute(pool)
    .await
    .map_err(|e| format!("신규 유저 생성 실패: {}", e))?;

    Ok(())
}

pub async fn get_preference_by_user_id(
    pool: &PgPool,
    user_id: i32,
) -> Result<PreferenceEntity, sqlx::Error> {
    sqlx::query_as::<_, PreferenceEntity>("SELECT * FROM user_preferences WHERE id = $1")
        .bind(user_id)
        .fetch_one(pool)
        .await
}

pub async fn increment_selection_count(pool: &PgPool, user_id: i32) -> Result<i32, String> {
    let rec = sqlx::query!(
        r#"
        UPDATE user_preferences
        SET selection_count = selection_count + 1
        WHERE id = $1
        RETURNING selection_count
        "#,
        user_id
    )
    .fetch_one(pool)
    .await
    .map_err(|e| format!("selection 증가 실패: {}", e))?;

    Ok(rec.selection_count)
}

pub async fn update_user_weights(
    pool: &PgPool,
    user_id: i32,
    w_price: f64,
    w_distance: f64,
) -> Result<(), String> {
    sqlx::query(
        "UPDATE user_preferences
         SET w_price = $1, w_distance = $2
         WHERE id = $3",
    )
    .bind(w_price)
    .bind(w_distance)
    .bind(user_id)
    .execute(pool)
    .await
    .map_err(|e| format!("가중치 업데이트 실패: {}", e))?;

    Ok(())
}
