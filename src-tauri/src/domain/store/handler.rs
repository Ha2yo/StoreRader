use axum::{Json, extract::{Query, State}, http::StatusCode, response::IntoResponse};
use serde_json::json;
use sqlx::PgPool;

use crate::domain::store::{dto::dto_req::GoodIdReq, service};

pub async fn get_all_stores_handler(State(pool): State<PgPool>) -> impl IntoResponse {
    match service::get_all_stores(&pool).await {
        Ok(res) => (StatusCode::OK, res.into_response()),
        Err(e) => (
            StatusCode::INTERNAL_SERVER_ERROR,
            Json(json!({ "message": e })).into_response(),
        ),
    }
}

pub async fn get_stores_by_good_id(Query(param): Query<GoodIdReq>) -> impl IntoResponse {
    format!("good_id = {}", param.good_id)
}
