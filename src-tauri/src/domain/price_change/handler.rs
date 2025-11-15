use axum::{Json, extract::{Query, State}, http::status::StatusCode};
use sqlx::PgPool;

use crate::domain::price_change::{dto::{dto_req::PriceTrendReq, dto_res::PriceTrendRes}, service::get_price_change};

pub async fn get_price_change_handler(
    State(pool): State<PgPool>,
    Query(req): Query<PriceTrendReq>,
) -> Result<Json<Vec<PriceTrendRes>>, StatusCode> {

    let result = get_price_change(&pool, &req.status)
        .await
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

    Ok(Json(result))
}