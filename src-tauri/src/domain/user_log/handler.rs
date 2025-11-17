/************************************************************************
 * File: domain/user_log/handler.rs
 * Description:
 *     사용자 매장 선택 기록 도메인의 라우팅 계층으로,
 *     클라이언트 요청을 받아 서비스 계층으로 전달하고
 *     그 결과를 HTTP 응답 형태로 반환한다.
 *
 * Responsibilities:
 *     1) user_selection_log_update_handler()
 *         - 사용자의 매장 선택 기록을 저장
 *
 *     2) user_selection_log_get_handler()
 *         - 사용자의 매장 선택 기록 전체 조회
************************************************************************/

use crate::{common::token::extract_token::extract_token, domain::user_log::{
    dto::dto_req::UserSelectionLogReq,
    service::{get_user_selection_logs, update_user_selection_log},
}};
use axum::{
    extract::State,
    http::{status::StatusCode, HeaderMap},
    response::IntoResponse,
    Json,
};
use serde_json::json;
use sqlx::PgPool;

/// 사용자의 매장 선택 기록을 저장한다.
///
/// # Arguments
/// * `pool`    - DB 커넥션 풀
/// * `headers` - Authorization 헤더
/// * `payload` - 저장할 매장 정보
///
/// # Returns
/// * `200 OK`                      - 저장 성공
/// * `401 UNAUTHORIZED`            - Authorization 헤더 누락 / 형식 오류
/// * `500 INTERNAL_SERVER_ERROR`   - 저장 실패
pub async fn user_selection_log_update_handler(
    State(pool): State<PgPool>,
    headers: HeaderMap,
    Json(payload): Json<UserSelectionLogReq>,
) -> impl IntoResponse {
    // 1) 토큰 추출
    let token = match extract_token(&headers) {
        Ok(t) => t,
        Err((status, resp)) => {
            return (status, resp); 
        }
    };

    // 2) 서비스 호출
    match update_user_selection_log(&pool, token, payload).await {
        Ok(msg) => (
            StatusCode::OK,
            Json(json!({ "message": msg })).into_response(),
        ),
        Err(e) => (
            StatusCode::INTERNAL_SERVER_ERROR,
            Json(json!({ "message": e })).into_response(),
        ),
    }
}

/// 사용자의 전체 선택 기록을 조회한다.
///
/// # Arguments
/// * `pool`    - DB 커넥션 풀
/// * `headers` - Authorization 헤더
///
/// # Returns
/// * `200 OK`                      - 조회 성공
/// * `401 UNAUTHORIZED`            - Authorization 헤더 누락 / 형식 오류
/// * `500 INTERNAL_SERVER_ERROR`   - 조회 실패
pub async fn user_selection_log_get_handler(
    State(pool): State<PgPool>,
    headers: HeaderMap,
) -> impl IntoResponse {
    // 1) 토큰 추출
    let token = match extract_token(&headers) {
        Ok(t) => t,
        Err((status, resp)) => {
            return (status, resp); 
        }
    };

    // 2) 서비스 호출
    match get_user_selection_logs(&pool, token).await {
        Ok(logs) => (StatusCode::OK, Json(logs).into_response()),
        Err(e) => (
            StatusCode::INTERNAL_SERVER_ERROR,
            Json(json!({ "message": e })).into_response(),
        ),
    }
}
