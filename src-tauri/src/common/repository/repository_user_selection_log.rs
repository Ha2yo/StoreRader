use sqlx::PgPool;

use crate::domain::log::dto::dto_req::UserSelectionLogReq;

pub async fn insert_user_selection_log(
    pool: &PgPool,
    user_id: i32,
    payload: &UserSelectionLogReq,
) -> Result<(), String> {
        sqlx::query(
        "INSERT INTO user_selection_log (user_id, store_id, good_id, preference_type)
         VALUES ($1, $2, $3, $4)",
    )
    .bind(user_id)
    .bind(&payload.store_id)
    .bind(&payload.good_id)
    .bind(&payload.preference_type)
    .execute(pool)
    .await
    .map_err(|e| format!("신규 유저 생성 실패: {}", e))?;

    Ok(())
}