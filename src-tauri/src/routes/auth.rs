use axum::Json;
use axum::extract::State;
use serde::{Deserialize, Serialize};
use sqlx::PgPool;

use crate::auth::jwt::create_jwt;
use crate::auth::verify::verify_google_id_token;
use crate::db::users::find_and_create_user;

#[derive(Deserialize)]
pub struct GoogleLoginReq {
    pub id_token: String,
    pub client_id: String,
}

#[derive(Serialize)]
pub struct User  {
    pub id: i32,
    pub name: String,
    pub email: String,
}

#[derive(Serialize)]
pub struct GoogleLoginRes {
    pub jwt: String,
    pub user: User,
}

pub async fn login_with_google(
    State(pool): State<PgPool>,    
    Json(req): Json<GoogleLoginReq>,
) -> Result<Json<GoogleLoginRes>, String> {

    // Google 검증
    let claims = verify_google_id_token(req.id_token, req.client_id)
        .await
        .map_err(|e| format!("Google 검증 실패: {}", e))?;

    // DB 조회/생성
    let user = find_and_create_user(
        &pool,
        &claims.sub,
        &claims.email,
        &claims.name,
    ).await?;

    // JWT 발급
    let jwt = create_jwt(
        user.id.to_string(),
        user.email.clone()
    ).map_err(|e| format!("JWT 생성 실패: {e}"))?;

    // 응답 반환
    Ok(Json(GoogleLoginRes {
        jwt,
        user: User {
            id: user.id,
            name: user.name,
            email: user.email,
        }
    }))
}