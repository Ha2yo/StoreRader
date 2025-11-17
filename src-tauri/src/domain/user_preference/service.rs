/************************************************************************
 * File: domain/user_preference/service.rs
 * Description:
 *     사용자 선호도 도메인의 서비스 로직을 처리한다.
 *
 * Responsibilities:
 *     1) get_user_preference()
 *         - JWT에서 user_id를 추출하고
 *           해당 사용자의 가중치를 조회
************************************************************************/

use sqlx::PgPool;

use crate::{
    common::{
        entity::entity_user_preference::PreferenceEntity,
        repository::repository_user_preference::find_preference_by_user_id,
    },
    domain::auth::service::decode_jwt,
};

/// 로그인된 사용자의 가격/거리 가중치를 조회한다.
/// 
/// # Arguments
/// * `pool`    - DB 커넥션 풀
/// * `token`   - JWT 문자열
/// 
/// # Returns
/// * `Ok(PreferenceEntity)`    - 조회 성공
/// * `Err(String)`             - 조회 실패
pub async fn get_user_preference(
    pool: &PgPool, 
    token: &str
) -> Result<PreferenceEntity, String> {
    let claims = decode_jwt(token)?;
    let user_id: i32 = claims
        .sub
        .parse::<i32>()
        .map_err(|_| "user_id 파싱 실패 (JWT sub이 숫자가 아님)".to_string())?;

    let pref = find_preference_by_user_id(pool, user_id)
        .await
        .map_err(|e| format!("선호도 조회 실패: {}", e))?;

    Ok(pref)
}
