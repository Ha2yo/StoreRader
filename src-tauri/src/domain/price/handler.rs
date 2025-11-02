use axum::{extract::{Query, State}, Json};
use sqlx::PgPool;

use crate::domain::price::{dto::{dto_req::PriceReq, dto_res::PriceRes}, service::get_latest_prices};

pub async fn get_prices_handler(
    State(pool): State<PgPool>,
    Query(params): Query<PriceReq>,
) -> Json<Vec<PriceRes>> {
    let result = get_latest_prices(&pool, &params.good_name)
        .await
        .unwrap_or_default();
    Json(result)
}
