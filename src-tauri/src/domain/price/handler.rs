/************************************************************************
 * File: domain/price/handler.rs
 * Description:
 *     가격(price) 도메인의 라우팅 계층으로,
 *     클라이언트 요청을 받아 서비스 계층으로 전달하고
 *     그 결과를 HTTP 응답 형태로 반환한다.
 *
 * Responsibilities:
 *     1) prices_get_handler()
 *         - 특정 상품의 최신 가격 목록 조회 처리
************************************************************************/

use axum::{
    extract::{Query, State},
    http::status::StatusCode,
    response::IntoResponse,
    Json,
};
use serde_json::json;
use sqlx::PgPool;

use crate::domain::price::{dto::dto_req::PriceReq, service::get_latest_prices};

/// 특정 상품명에 대한 최신 가격 목록을 조회하는 핸들러이다.
///
/// # Arguments
/// * `pool`    - DB 연결 풀
/// * `params`  - PriceReq { good_name }
///
/// # Returns
/// * `200 Ok`                      - 최신 가격 목록 반환
/// * `500 INTERNAL_SERVER_ERROR`   - 조회 실패
pub async fn prices_get_handler(
    State(pool): State<PgPool>,
    Query(param): Query<PriceReq>,
) -> impl IntoResponse {
    match get_latest_prices(&pool, &param.good_name).await {
        Ok(list) => (StatusCode::OK, Json(list).into_response()),
        Err(e) => (
            StatusCode::INTERNAL_SERVER_ERROR,
            Json(json!({ "message": e })).into_response(),
        ),
    }
}
