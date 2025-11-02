use axum::{Json, extract::{Query, State}, response::IntoResponse};
use reqwest::StatusCode;
use serde_json::json;
use sqlx::PgPool;

use crate::domain::sync::{dto::dto_req::InspectDayRes, service};

pub async fn upsert_api_data_handler(State(pool): State<PgPool>) -> impl IntoResponse {
    match service::upsert_api_data(&pool).await {
        Ok(res) => (StatusCode::OK, res.into_response()),
        Err(e) => (
            StatusCode::INTERNAL_SERVER_ERROR,
            Json(json!({ "message": e })).into_response(),
        ),
    }
}

pub async fn upsert_prices_handler(State(pool): State<PgPool>, Query(param): Query<InspectDayRes>) -> impl IntoResponse {
    match service::upsert_price(&pool, &param.inspect_day).await {
        Ok(res) => (StatusCode::OK, res.into_response()),
        Err(e) => (
            StatusCode::INTERNAL_SERVER_ERROR,
            Json(json!({ "message": e })).into_response(),
        ),
    }
}