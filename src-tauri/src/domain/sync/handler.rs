/************************************************************************
 * File: domain/sync/handler.rs
 * Description:
 *     공공데이터 API 동기화 도메인의 라우팅 계층으로,
 *     클라이언트 요청을 받아 서비스 계층으로 전달하고
 *     그 결과를 HTTP 응답 형태로 반환한다.
 *
 * Responsibilities:
 *     1) sync_goods_and_stores_handler()
 *         - 상품 + 매장 데이터 동기화
 * 
 *     2) sync_prices_handler()
 *         - 특정 조사일의 가격 데이터 동기화
 * 
 *     3) sync_regions_codes_handler()
 *         - 지역코드 데이터 동기화
************************************************************************/

use axum::{
    extract::{Query, State},
    response::IntoResponse,
    Json,
};
use reqwest::StatusCode;
use serde_json::json;
use sqlx::PgPool;

use crate::domain::sync::{
    dto::dto_req::InspectDayReq,
    service,
};

/// 상품 + 매장 데이터를 공공데이터 API에서 받아 DB에 갱신한다.
/// 
/// # Arguments
/// * `pool` - DB 커넥션 풀
/// 
/// # Returns
/// * `200 OK`                      - 갱신 성공
/// * `500 INTERNAL_SERVER_ERROR`   - 갱신 실패
pub async fn sync_goods_and_stores_handler(
    State(pool): State<PgPool>
) -> impl IntoResponse {
    match service::upsert_good_and_store(&pool).await {
        Ok(res) => (StatusCode::OK, res.into_response()),
        Err(e) => (
            StatusCode::INTERNAL_SERVER_ERROR,
            Json(json!({ "message": e })).into_response(),
        ),
    }
}

/// 특정 조사일의 가격 데이터를 공공데이터 API에서 받아 DB에 저장한다.
/// 
/// # Arguments
/// * `pool`    - DB 커넥션 풀
/// * `param`   - InspectDayReq { inspect_day }
/// 
/// # Returns
/// * `200 OK`                      - 저장 성공
/// * `500 INTERNAL_SERVER_ERROR`   - 저장 실패
pub async fn sync_prices_handler(
    State(pool): State<PgPool>,
    Query(param): Query<InspectDayReq>,
) -> impl IntoResponse {
    match service::upsert_price(&pool, &param.inspect_day).await {
        Ok(res) => (StatusCode::OK, res.into_response()),
        Err(e) => (
            StatusCode::INTERNAL_SERVER_ERROR,
            Json(json!({ "message": e })).into_response(),
        ),
    }
}

/// 지역코드 데이터를 공공데이터 API에서 받아 DB에 갱신한다.
/// 
/// # Arguments
/// * `pool` - DB 커넥션 풀
/// 
/// # Returns
/// * `200 OK`                      - 갱신 성공
/// * `500 INTERNAL_SERVER_ERROR`   - 갱신 실패
pub async fn sync_region_codes_handler(State(pool): State<PgPool>) -> impl IntoResponse {
    match service::upsert_region_codes(&pool).await {
        Ok(res) => (StatusCode::OK, res.into_response()),
        Err(e) => (
            StatusCode::INTERNAL_SERVER_ERROR,
            Json(json!({ "message": e })).into_response(),
        ),
    }
}
