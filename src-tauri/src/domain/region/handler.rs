use axum::{Json, extract::State, response::IntoResponse};
use reqwest::StatusCode;
use serde_json::json;
use sqlx::PgPool;

use crate::domain::region::service;

pub async fn get_all_region_codes_handler(State(pool): State<PgPool>) -> impl IntoResponse {
    match service::get_all_region_codes(&pool).await {
        Ok(res) => (StatusCode::OK, res.into_response()),
        Err(e) => (
            StatusCode::INTERNAL_SERVER_ERROR,
            Json(json!({ "message": e })).into_response(),
        ),
    }
}