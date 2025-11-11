use sqlx::PgPool;

use crate::{
    common::repository::{
        repository_user_preference::{
            get_preference_by_user_id, increment_selection_count, update_user_weights,
        },
        repository_user_selection_log::{get_recent_10_logs, insert_user_selection_log},
    },
    domain::{auth::service::decode_jwt, log::dto::dto_req::UserSelectionLogReq},
};

pub async fn update_user_selection_log(
    pool: &PgPool,
    token: &str,
    payload: UserSelectionLogReq,
) -> Result<(), String> {
    // JWT 검증
    let claims = decode_jwt(token)?;
    let user_id: i32 = claims
        .sub
        .parse::<i32>()
        .map_err(|_| "user_id 파싱 실패 (JWT sub이 숫자가 아님)".to_string())?;

    // 1) 로그 저장
    insert_user_selection_log(pool, user_id, &payload)
        .await
        .map_err(|e| format!("로그 저장 실패: {}", e))?;

    // 2) selection_count 증가
    let selection_count = increment_selection_count(pool, user_id)
        .await
        .map_err(|e| format!("selection_count 증가 실패: {}", e))?;

    // 3) selection_count가 10일 때만 갱신 로직 실행
    if selection_count % 10 == 0 {
        // 기존 가중치 가져오기
        let old_preference = get_preference_by_user_id(pool, user_id)
            .await
            .map_err(|e| format!("이전 선호도 조회 실패: {}", e))?;

        // 최근 10개 로그 조회
        let logs = get_recent_10_logs(pool, user_id)
            .await
            .map_err(|e| format!("최근 로그 조회 실패: {}", e))?;

        // price 중심 선택 횟수 계산
        let price_focus = logs.iter().filter(|l| l.preference_type == "price").count();
        let price_ratio = price_focus as f64 / 10.0;

        // 가중치 계산
        let new_w_price_raw = 0.2 + price_ratio * 0.6;

        // 과거 가중치와 혼합
        let alpha = 0.2; // 최근 데이터 반영 비율
        let w_price = old_preference.w_price * (1.0 - alpha) + new_w_price_raw * alpha;
        let w_distance = 1.0 - w_price;

        // DB 업데이트
        update_user_weights(pool, user_id, w_price, w_distance)
            .await
            .map_err(|e| format!("가중치 업데이트 실패: {}", e))?;
    }

    Ok(())
}
