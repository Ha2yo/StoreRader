/************************************************************************
 * File: common/repository/user_selection_log.rs
 * Description:
 *     user_selection_log 테이블에 대한 DB 연산 로직을 담당한다.
 *
 * Responsibilities:
 *     1) insert_user_selection_log()   
 *         - 매장 선택 로그 저장
 * 
 *     2) find_recent_10_logs()         
 *         - 최근 10개 선택 로그 조회
************************************************************************/

use sqlx::PgPool;

use crate::domain::user_log::dto::{dto_recent_log::LogRow, dto_req::UserSelectionLogReq};

/// 사용자의 매장 선택 기록을 저장한다.
/// 
/// # Arguments
/// * `pool`    - DB 커넥션 풀
/// * `user_id` - 사용자 ID
/// * `payload` - 기록에 필요한 각종 정보가 담긴 구조체
/// 
/// # Returns
/// * `Ok(())`      - 삽입 성공
/// * `Err(String)` - 삽입 실패
pub async fn insert_user_selection_log(
    pool: &PgPool,
    user_id: i32,
    payload: &UserSelectionLogReq,
) -> Result<(), String> {
    sqlx::query(
        "
        INSERT INTO user_selection_log (
            user_id, 
            store_id, 
            good_id, 
            preference_type, 
            price
        )
         VALUES (
            $1, 
            $2, 
            $3, 
            $4, 
            $5
        )
        ",
    )
    .bind(user_id)
    .bind(&payload.store_id)
    .bind(&payload.good_id)
    .bind(&payload.preference_type)
    .bind(&payload.price)
    .execute(pool)
    .await
    .map_err(|e| format!("신규 유저 생성 실패: {}", e))?;

    Ok(())
}

/// 특정 사용자의 최근 10개의 preference_type 로그를 조회한다.
/// 
/// # Arguments
/// * `pool`    - DB 커넥션 풀
/// * `user_id` - 사용자 ID
/// 
/// # Returns
/// * `Ok(<Vec<LogRow>)`    - 최근 10개의 preference_type 로그
/// * `Err(String)`         - 조회 실패
pub async fn find_recent_10_logs(
    pool: &PgPool, 
    user_id: i32
) -> Result<Vec<LogRow>, String> {
    let rows = sqlx::query_as::<_, LogRow>(
        "
        SELECT 
            preference_type
        FROM user_selection_log
        WHERE user_id = $1
        ORDER BY created_at DESC
        LIMIT 10
        ",
    )
    .bind(user_id)
    .fetch_all(pool)
    .await
    .map_err(|e| format!("preference_type 조회 실패: {}", e))?;

    Ok(rows)
}
