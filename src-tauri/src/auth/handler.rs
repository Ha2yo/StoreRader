use axum::{extract::State, http::StatusCode, response::IntoResponse, Extension, Json};
use serde_json::json;
use sqlx::PgPool;

use super::service;

use crate::auth::dto::req::GoogleLoginReq;

pub async fn auth_google_handler(
    State(pool): State<PgPool>,
    Json(req): Json<GoogleLoginReq>
) -> impl IntoResponse {
    match service::auth_google(&pool, req).await {
        Ok(res) => (StatusCode::OK, res.into_response()),
        Err(e) => {
            return (
                StatusCode::BAD_REQUEST,
                Json(json!({
                    "message": e
            }))
                .into_response(),
            )
        }
    }
}