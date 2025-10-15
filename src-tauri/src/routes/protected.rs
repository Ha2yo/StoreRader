use axum::{
    extract::State,
    http::{HeaderMap, StatusCode},
    Json,
};
use sqlx::PgPool;
use crate::auth::jwt::decode_jwt;
use crate::db::users::get_user_by_sub;

#[derive(Debug, serde::Serialize)]
pub struct UserProfile {
    pub id: i32,
    pub email: String,
    pub name: String,
    pub created_at: String,
}

pub async fn me(
    headers: HeaderMap,
    State(pool): State<PgPool>
) -> Result<Json<UserProfile>, (StatusCode, String)> {
    let auth_header = headers
        .get("Authorization")
        .and_then(|v| v.to_str().ok())
        .ok_or((StatusCode::UNAUTHORIZED, "Authorization header missing".to_string()))?;

    if !auth_header.starts_with("Bearer ") {
        return Err((StatusCode::UNAUTHORIZED, "Invalid Authorization format".to_string()));
    }

    let token = auth_header.trim_start_matches("Bearer ").trim();
    let claims = decode_jwt(token)
        .map_err(|_| (StatusCode::UNAUTHORIZED, "Invalid or expired token".to_string()))?;

    let user = get_user_by_sub(&pool, &claims.sub).await
        .map_err(|_| (StatusCode::INTERNAL_SERVER_ERROR, "User not found".to_string()))?;

    Ok(Json(UserProfile {
        id: user.id,
        email: user.email,
        name: user.name,
        created_at: user.created_at.to_string(),
    }))
}
