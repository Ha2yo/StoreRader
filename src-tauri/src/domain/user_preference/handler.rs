/************************************************************************
 * File: domain/user_preference/handler.rs
 * Description:
 *     사용자 선호도 도메인의 라우팅 계층으로,
 *     클라이언트 요청을 받아 서비스 계층으로 전달하고
 *     그 결과를 HTTP 응답 형태로 반환한다.
 *
 * Responsibilities:
 *     1) user_preference_get_handler()
 *         - 로그인된 사용자의 가격/거리 가중치 조회
************************************************************************/

use crate::{
    common::token::extract_token::extract_token,
    domain::user_preference::{dto::dto_res::PreferenceRes, service::get_user_preference},
};
use axum::{
    extract::State,
    http::{status::StatusCode, HeaderMap},
    response::IntoResponse,
    Json,
};
use serde_json::json;
use sqlx::PgPool;

/// 로그인된 사용자의 가격/거리 가중치를 조회한다
/// 
/// # Arguments
/// * `pool`    - DB 커넥션 풀
/// * `headers` - Authorization 헤더
///
/// # Returns
/// * `200 OK`                      - 조회 성공
/// * `401 UNAUTHORIZED`            - Authorization 헤더 누락 / 형식 오류
/// * `404 NOT_FOUND`               - 사용자의 선호도 데이터 없음  
/// * `500 INTERNAL_SERVER_ERROR`   - 조회 실패
pub async fn user_preference_get_handler(
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
    match get_user_preference(&pool, token).await {
        Ok(pref) => (
            StatusCode::OK,
            Json(PreferenceRes {
                w_price: pref.w_price,
                w_distance: pref.w_distance,
            })
            .into_response(),
        ),
        Err(e) if e.contains("유저") => (
            StatusCode::NOT_FOUND,
            Json(json!({ "message": e })).into_response(),
        ),
        Err(e) => (
            StatusCode::INTERNAL_SERVER_ERROR,
            Json(json!({ "message": e })).into_response(),
        ),
    }
}
