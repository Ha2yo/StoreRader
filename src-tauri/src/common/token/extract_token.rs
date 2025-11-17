/************************************************************************
 * File: common/token/extract_token.rs
 * Description:
 *     HTTP 요청 헤더에서 토큰을 추출하는 공용 함수
 *
 * Responsibilities:
 *     1) extract_token()
 *         - 
************************************************************************/

use axum::Json;
use axum::{
    http::{HeaderMap, StatusCode},
    response::IntoResponse,
};
use serde_json::json;

/// Authorization 헤더에서 Bearer 토큰을 추출한다.
/// 
/// # Arguments
/// * `headers` - HTTP 요청의 HeaderMap
/// 
/// # Returns
/// * `Ok(&str)`
/// * `Err(`
pub fn extract_token(
    headers: &HeaderMap
) -> Result<&str, (StatusCode, axum::response::Response)> {
    // Authorization 헤더 확인
    let auth_header = headers
        .get("Authorization")
        .and_then(|v| v.to_str().ok())
        .ok_or((
            StatusCode::UNAUTHORIZED,
            Json(json!({ "message": "Authorization header missing" })).into_response(),
        ))?;

    // Bearer 토큰 확인
    let token = auth_header.strip_prefix("Bearer ").ok_or((
        StatusCode::UNAUTHORIZED,
        Json(json!({ "message": "Invalid Authorization format" })).into_response(),
    ))?;

    Ok(token)
}
