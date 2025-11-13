use sqlx::{PgPool, prelude::FromRow};

use crate::domain::log::dto::dto_req::UserSelectionLogReq;

pub async fn insert_user_selection_log(
    pool: &PgPool,
    user_id: i32,
    payload: &UserSelectionLogReq,
) -> Result<(), String> {
        sqlx::query(
        "INSERT INTO user_selection_log (user_id, store_id, good_id, preference_type, price)
         VALUES ($1, $2, $3, $4, $5)",
    )
    .bind(user_id)
    .bind(&payload.store_id)
    .bind(&payload.good_id)
    .bind(&payload.preference_type)
    .bind(&payload.price)
    .execute(pool)
    .await
    .map_err(|e| format!("신규 유저 생성 실패: {}", e))?;

    Ok(())
}

#[derive(Debug, FromRow)]
pub struct LogRow {
    pub preference_type: String,
}

pub async fn get_recent_10_logs(pool: &PgPool, user_id: i32) -> Result<Vec<LogRow>, sqlx::Error> {
    let rows = sqlx::query_as!(
        LogRow,
        r#"
        SELECT preference_type
        FROM user_selection_log
        WHERE user_id = $1
        ORDER BY created_at DESC
        LIMIT 10
        "#,
        user_id
    )
    .fetch_all(pool)
    .await?;
    Ok(rows)
}