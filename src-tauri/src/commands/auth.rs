use serde::Serialize;
use tauri::State;

use crate::auth::verify::{verify_google_id_token, GoogleClaims};
use crate::auth::jwt::create_jwt;
use crate::db::connect::PgPoolWrapper;
use crate::db::users::find_and_create_user;

#[derive(Serialize)]
pub struct LoginResponse {
    jwt: String,
    user: UserPayload,
}

#[derive(Serialize)]
pub struct UserPayload {
    id: i32,
    sub: String,
    email: String,
    name: String,
}

#[tauri::command]
pub async fn c_login_user(
    state: State<'_, PgPoolWrapper>,
    id_token: String,
    client_id: String
    ) -> Result<LoginResponse, String> {
    let claims = verify_google_id_token(id_token, client_id)
        .await
        .map_err(|e| format!("구글 토큰 검증 실패: {}", e))?;

    let sub = claims.sub.clone();
    let email = claims.email.clone();
    let name = claims.name.clone();

    let user = find_and_create_user(state, &sub, &email, &name)
        .await
        .map_err(|e| format!("DB 처리 실패: {}", e))?;

    let jwt = create_jwt(sub, email)
        .map_err(|e| format!("JWT 발급 실패: {e}"))?;

    let payload = UserPayload {
        id: user.id,
        sub: user.sub,
        email: user.email,
        name: user.name,
    };

    Ok(LoginResponse { jwt, user: payload })
}