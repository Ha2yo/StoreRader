use sqlx::PgPool;

use crate::{common::{entity::entity_user_preference::PreferenceEntity, repository::repository_user_preference::get_preference_by_user_id}, domain::auth::service::decode_jwt};

pub async fn get_user_preference(pool: &PgPool, token: &str) -> Result<PreferenceEntity, String> {
     // JWT 검증
    let claims = decode_jwt(token)?;
    let user_id: i32 = claims
        .sub
        .parse::<i32>()
        .map_err(|_| "user_id 파싱 실패 (JWT sub이 숫자가 아님)".to_string())?;

    // preferences 조회
    let pref = get_preference_by_user_id(pool, user_id)
        .await
        .map_err(|e| format!("선호도 조회 실패: {}", e))?;

    Ok(pref)
}