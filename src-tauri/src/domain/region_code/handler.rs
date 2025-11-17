/************************************************************************
 * File: domain/region_code/handler.rs
 * Description:
 *     지역 코드(region_code) 도메인의 라우팅 계층으로,
 *     클라이언트 요청을 받아 서비스 계층으로 전달하고
 *     그 결과를 HTTP 응답 형태로 반환한다.
 *
 * Responsibilities:
 *     1) region_codes_list_handler()
 *         - 전체 지역 코드 목록 조회 처리
************************************************************************/

use axum::{extract::State, response::IntoResponse, Json};
use reqwest::StatusCode;
use serde_json::json;
use sqlx::PgPool;

use crate::domain::region_code::service;

/// 전체 지역 코드(region_code) 목록을 조회하는 핸들러이다.
///
/// # Arguments
/// * `pool`    - DB 연결 풀
///
/// # Returns
/// * `200 Ok`                      - 지역 코드 목록 반환
/// * `500 INTERNAL_SERVER_ERROR`   - 조회 실패
pub async fn region_codes_list_handler(
    State(pool): State<PgPool>
) -> impl IntoResponse {
    match service::get_all_region_codes(&pool).await {
        Ok(res) => (StatusCode::OK, res.into_response()),
        Err(e) => (
            StatusCode::INTERNAL_SERVER_ERROR,
            Json(json!({ "message": e })).into_response(),
        ),
    }
}
