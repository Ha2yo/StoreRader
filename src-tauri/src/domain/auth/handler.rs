/***********************************************************
 handler.rs는 라우팅 계층의 진입점으로
 클라이언트 요청을 받아 서비스 레이어로 전달하고
 결과를 HTTP 응답 형태로 반환한다

 1. auth_google_handler()
    - Google 로그인 요청 처리를 한다
***********************************************************/

use axum::{extract::State, http::StatusCode, response::IntoResponse, Json};
use serde_json::json;
use sqlx::PgPool;

use crate::domain::auth::service;
use crate::domain::auth::dto::dto_req::GoogleLoginReq;

// auth_google_handler()
// 기능: Google 로그인 요청 처리 핸들러
// 입력: state(pool): DB 연결 풀, Json(req): GoogleLoginReq { id_token, client_id }
// 출력: (200 OK, JWT + 유저 정보 JSON) OR (400 Bad Request, 에러 메시지)
pub async fn auth_google_handler(
    State(pool): State<PgPool>,
    Json(req): Json<GoogleLoginReq>,
) -> impl IntoResponse {
    match service::auth_google(&pool, req).await {
        Ok(res) => (StatusCode::OK, res.into_response()),
        Err(e) => {
            return (
                StatusCode::BAD_REQUEST,
                Json(json!({
                        "message": e
                }))
                .into_response(),
            )
        }
    }
}
