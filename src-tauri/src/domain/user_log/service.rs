/************************************************************************
 * File: domain/good/service.rs
 * Description:
 *     사용자 매장 선택 기록 도메인의 서비스 로직을 처리한다.
 *
 * Responsibilities:
 *     1) update_user_selection_log()
 *         - 사용자의 매장 선택 기록을 저장한다.
 *         - selection_count에 따라 가중치를 갱신한다.
 * 
 *     2) get_user_selection_logs()
 *         - 사용자의 전체 선택 기록을 조회하여 반환한다.
************************************************************************/
use sqlx::PgPool;

use crate::{
    common::repository::{
        repository_join::find_user_selection_logs,
        repository_user_preference::{
            find_preference_by_user_id, increment_selection_count, update_user_weights,
        },
        repository_user_selection_log::{find_recent_10_logs, insert_user_selection_log},
    },
    domain::{
        auth::service::decode_jwt,
        user_log::dto::{dto_req::UserSelectionLogReq, dto_res::UserSelectionLogRes},
    },
};

/// 사용자의 매장 선택 기록을 저장하고,
/// 선택 회수가 10회가 되면 사용자 가중치를 자동 갱신한다.
/// 
/// # Arguments
/// * `pool`    - DB 커넥션 풀
/// * `token`   - JWT 문자열
/// * `payload` - 저장할 선택 기록 데이터
/// 
/// # Returns
/// * `Ok(())`      - 저장 성공
/// * `Err(String)` - 저장 실패
pub async fn update_user_selection_log(
    pool: &PgPool,
    token: &str,
    payload: UserSelectionLogReq,
) -> Result<(), String> {
    let claims = decode_jwt(token)?;
    let user_id: i32 = claims
        .sub
        .parse::<i32>()
        .map_err(|_| "user_id 파싱 실패 (JWT sub이 숫자가 아님)".to_string())?;

    insert_user_selection_log(pool, user_id, &payload)
        .await
        .map_err(|e| format!("로그 저장 실패: {}", e))?;

    let selection_count = increment_selection_count(pool, user_id)
        .await
        .map_err(|e| format!("selection_count 증가 실패: {}", e))?;

    if selection_count % 10 == 0 {
        let old_preference = find_preference_by_user_id(pool, user_id)
            .await
            .map_err(|e| format!("이전 선호도 조회 실패: {}", e))?;

        let logs = find_recent_10_logs(pool, user_id)
            .await
            .map_err(|e| format!("최근 로그 조회 실패: {}", e))?;

        let price_focus = logs.iter().filter(|l| l.preference_type == "price").count();
        let price_ratio = price_focus as f64 / 10.0;

        let new_w_price_raw = 0.2 + price_ratio * 0.6;

        // 과거 가중치와 혼합
        let alpha = 0.2; // 최근 데이터 반영 비율
        let mut w_price = old_preference.w_price * (1.0 - alpha) + new_w_price_raw * alpha;

        w_price = (w_price * 1000.0).round() / 1000.0;
        let w_distance = 1.0 - w_price;

        update_user_weights(pool, user_id, w_price, w_distance)
            .await
            .map_err(|e| format!("가중치 업데이트 실패: {}", e))?;
    }

    Ok(())
}

/// 사용자의 전체 선택 기록을 조회한다.
/// 
/// # Arguments
/// * `pool`    - DB 커넥션 풀
/// * `token`   - JWT 문자열
/// 
/// # Returns
/// * `Ok(<Vec<UserSelectionLogRes>)`   - 조회 성공
/// * `Err(String)`                     - 조회 실패
pub async fn get_user_selection_logs(
    pool: &PgPool,
    token: &str,
) -> Result<Vec<UserSelectionLogRes>, String> {
    let claims = decode_jwt(token)?;
    let user_id: i32 = claims
        .sub
        .parse::<i32>()
        .map_err(|_| "유효하지 않은 사용자 ID입니다".to_string())?;

    find_user_selection_logs(pool, user_id).await
}
