use axum::Json;
use axum::extract::State;
use serde::{Deserialize, Serialize};
use sqlx::PgPool;

use crate::auth::verify::verify_google_id_token;
use crate::db::connect::PgPoolWrapper;
use crate::db::users::find_and_create_user;

#[derive(Deserialize)]
pub struct GoogleLoginReq {
    pub id_token: String,
    pub client_id: String,
}

#[derive(Serialize)]
pub struct GoogleLoginRes {
    pub id: i32,
    pub name: String,
    pub email: String,
}

pub async fn login_with_google(
    State(pool): State<PgPool>,    
    Json(req): Json<GoogleLoginReq>,
) -> Result<Json<GoogleLoginRes>, String> {

    let claims = verify_google_id_token(req.id_token, req.client_id)
        .await
        .map_err(|e| format!("Google 검증 실패: {}", e))?;

    let user = find_and_create_user(
        &pool,
        &claims.sub,
        &claims.email,
        &claims.name,
    ).await?;

    Ok(Json(GoogleLoginRes {
        id: user.id,
        name: user.name,
        email: user.email,
    }))
}