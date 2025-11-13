use axum::{
    extract::State,
    http::{status::StatusCode, HeaderMap},
    response::IntoResponse,
    Json,
};
use sqlx::PgPool;

use crate::domain::log::{
    dto::{dto_req::UserSelectionLogReq, dto_res::UserSelectionLogRes},
    service::{get_user_selection_logs, update_user_selection_log},
};

pub async fn update_user_selection_log_handler(
    State(pool): State<PgPool>,
    headers: HeaderMap,
    Json(payload): Json<UserSelectionLogReq>,
) -> impl IntoResponse {
    let auth_header = headers
        .get("Authorization")
        .and_then(|v| v.to_str().ok())
        .ok_or((
            StatusCode::UNAUTHORIZED,
            "Authorization header missing".to_string(),
        ))?;

    let token = auth_header.strip_prefix("Bearer ").ok_or((
        StatusCode::UNAUTHORIZED,
        "Invalid Authorization format".to_string(),
    ))?;

    match update_user_selection_log(&pool, token, payload).await {
        Ok(msg) => Ok((StatusCode::OK, msg)),
        Err(e) => Err((StatusCode::INTERNAL_SERVER_ERROR, e)),
    }
}

pub async fn get_user_selection_log_handler(
    State(pool): State<PgPool>,
    headers: HeaderMap,
) -> Result<Json<Vec<UserSelectionLogRes>>, (StatusCode, String)> {
    let auth_header = headers
        .get("Authorization")
        .and_then(|v| v.to_str().ok())
        .ok_or((
            StatusCode::UNAUTHORIZED,
            "Authorization header missing".to_string(),
        ))?;

    let token = auth_header.strip_prefix("Bearer ").ok_or((
        StatusCode::UNAUTHORIZED,
        "Invalid Authorization format".to_string(),
    ))?;

    let logs = get_user_selection_logs(&pool, token)
        .await
        .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, e))?;

    Ok(Json(logs))
}
