/************************************************************************
 * File: domain/good/handler.rs
 * Description:
 *     상품(good) 도메인의 라우팅 계층으로,
 *     클라이언트 요청을 받아 서비스 계층으로 전달하고
 *     그 결과를 HTTP 응답 형태로 반환한다.
 *
 * Responsibilities:
 *     1) auth_google_handler()
 *         - 전체 상품 목록 조회 처리
************************************************************************/

use axum::{extract::State, http::StatusCode, response::IntoResponse, Json};
use serde_json::json;
use sqlx::PgPool;

use crate::domain::good::service;

/// 전체 상품(goods) 목록을 조회하는 핸들러이다.
///
/// # Arguments
/// * `pool`    - DB 연결 풀
///
/// # Returns
/// * `200 Ok`                      - 전체 상품 목록 반환
/// * `500 INTERNAL_SERVER_ERROR`   - 조회 실패
pub async fn goods_list_handler(
    State(pool): State<PgPool>
) -> impl IntoResponse {
    match service::get_all_goods(&pool).await {
        Ok(res) => (StatusCode::OK, res.into_response()),
        Err(e) => (
            StatusCode::INTERNAL_SERVER_ERROR,
            Json(json!({ "message": e })).into_response(),
        ),
    }
}
