use sqlx::PgPool;

use crate::{
    common::repository::{repository_user_preference::increment_selection_count, repository_user_selection_log::insert_user_selection_log},
    domain::{auth::service::decode_jwt, log::dto::dto_req::UserSelectionLogReq},
};

pub async fn update_user_selection_log(
    pool: &PgPool,
    token: &str,
    payload: UserSelectionLogReq,
) -> Result<(), String> {
    // JWT 검증
    let claims = decode_jwt(token)?;
    let user_id: i32 = claims
        .sub
        .parse::<i32>()
        .map_err(|_| "user_id 파싱 실패 (JWT sub이 숫자가 아님)".to_string())?;

    // 1) 로그 저장
    insert_user_selection_log(pool, user_id, &payload)
        .await
        .map_err(|e| format!("로그 저장 실패: {}", e))?;

    // 2) selection_count 증가
    increment_selection_count(pool, user_id)
        .await
        .map_err(|e| format!("selection_count 증가 실패: {}", e))?;

    Ok(())
}
