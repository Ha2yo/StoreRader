/************************************************************************
 * File: domain/auth/handler.rs
 * Description:
 *     인증(auth) 도메인의 라우팅 계층으로,
 *     클라이언트 요청을 받아 서비스 계층으로 전달하고
 *     그 결과를 HTTP 응답 형태로 반환한다.
 *
 * Responsibilities:
 *     1) auth_google_handler()
 *         - Google OAuth 로그인 요청 처리
************************************************************************/

use axum::{extract::State, http::StatusCode, response::IntoResponse, Json};
use serde_json::json;
use sqlx::PgPool;

use crate::domain::auth::dto::dto_req::GoogleLoginReq;
use crate::domain::auth::service;

/// Google 로그인 요청을 처리하는 핸들러이다.
///
/// # Arguments
/// * `pool`    - DB 연결 풀
/// * `req`     - GoogleLoginReq { id_token, client_id }
///
/// # Returns
/// * `200 Ok`          - { jwt, user {id, name, email } }
/// * `400 Bad Request` - { message: "에러 내용" }
pub async fn auth_google_handler(
    State(pool): State<PgPool>,
    Json(req): Json<GoogleLoginReq>,
) -> impl IntoResponse {
    match service::auth_google(&pool, req).await {
        Ok(res) => (StatusCode::OK, res.into_response()),
        Err(e) => (
            StatusCode::BAD_REQUEST,
            Json(json!({ "message": e })).into_response(),
        ),
    }
}