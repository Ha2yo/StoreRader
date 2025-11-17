/************************************************************************
 * File: domain/price_change/handler.rs
 * Description:
 *     가격 변동(price_change) 도메인의 라우팅 계층으로,
 *     클라이언트 요청을 받아 서비스 계층으로 전달하고
 *     그 결과를 HTTP 응답 형태로 반환한다.
 *
 * Responsibilities:
 *     1) sync_price_change_handler()
 *         - 가격변동 데이터 생성 및 동기화
 *
 *     1) price_change_get_handler()
 *         - 가격 상승/하락 데이터 조회 처리
************************************************************************/

use axum::{
    extract::{Query, State},
    http::status::StatusCode,
    response::IntoResponse,
    Json,
};
use sqlx::PgPool;

use serde_json::json;

use crate::domain::price_change::{
    dto::dto_req::{PriceChangeReq, PriceTrendReq},
    service::{get_price_change, upsert_price_change},
};

/// 가격변동 데이터를 생성하여 DB에 저장한다.
///
/// # Arguments
/// * `pool` - DB 커넥션 풀
/// * `param`   - PriceChangeReq { inspect_day }
///
///
/// # Returns
/// * `200 OK`                      - 갱신 성공
/// * `500 INTERNAL_SERVER_ERROR`   - 갱신 실패
pub async fn sync_price_change_handler(
    State(pool): State<PgPool>,
    Query(param): Query<PriceChangeReq>,
) -> impl IntoResponse {
    match upsert_price_change(&pool, &param.inspect_day).await {
        Ok(msg) => (StatusCode::OK, msg.into_response()),
        Err(e) => (
            StatusCode::INTERNAL_SERVER_ERROR,
            Json(json!({ "message": e })).into_response(),
        ),
    }
}

/// 가격 변동 (상승/하락) 정보를 조회하는 핸들러이다.
///
/// # Arguments
/// * `pool`    - DB 연결 풀
/// * `param`   - PriceTrendreq { status: "up" | "down" }
///
/// # Returns
/// * `200 Ok`                      - 가격 변동 리스트
/// * `500 INTERNAL_SERVER_ERROR`   - 조회 실패
pub async fn price_change_get_handler(
    State(pool): State<PgPool>,
    Query(param): Query<PriceTrendReq>,
) -> impl IntoResponse {
    match get_price_change(&pool, &param.status).await {
        Ok(list) => (StatusCode::OK, Json(list).into_response()),
        Err(e) => (
            StatusCode::INTERNAL_SERVER_ERROR,
            Json(json!({ "message": e })).into_response(),
        ),
    }
}
