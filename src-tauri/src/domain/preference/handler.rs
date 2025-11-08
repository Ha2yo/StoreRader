use axum::{Json, extract::State, http::{HeaderMap, status::StatusCode}};
use sqlx::PgPool;

use crate::domain::preference::{dto::dto_res::PreferenceRes, service::get_user_preference};

pub async fn get_user_preference_handler(
    State(pool): State<PgPool>,
    headers: HeaderMap,
) -> Result<Json<PreferenceRes>, (StatusCode, String)> {
    let auth_header = headers
        .get("Authorization")
        .and_then(|v| v.to_str().ok())
        .ok_or((StatusCode::UNAUTHORIZED, "Authorization header missing".to_string()))?;

    let token = auth_header
        .strip_prefix("Bearer ")
        .ok_or((StatusCode::UNAUTHORIZED, "Invalid Authorization format".to_string()))?;

    match get_user_preference(&pool, token).await {
        Ok(pref) => Ok(Json(PreferenceRes {
            w_price: pref.w_price,
            w_distance: pref.w_distance,
        })),
        Err(e) if e.contains("유저") => Err((StatusCode::NOT_FOUND, e)),
        Err(e) => Err((StatusCode::INTERNAL_SERVER_ERROR, e)),
    }
}