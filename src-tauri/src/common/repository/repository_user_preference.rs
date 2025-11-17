/************************************************************************
 * File: common/repository/repository_user_preference.rs
 * Description:
 *     user_preferences 테이블에 대한 DB 연산 로직을 담당한다.
 *
 * Responsibilities:
 *     1) insert_or_update_store()  
 *         - 매장 정보 저장
 * 
 *     2) get_all_store_id()        
 *         - 전체 매장 ID 목록 조회
 * 
 *     3) get_all_stores()          
 *         - 좌표가 존재하는 전체 매장 조회
************************************************************************/

use sqlx::{PgPool, Row};

use crate::common::entity::entity_user_preference::PreferenceEntity;

/// 신규 유저에게 기본 가중치(0.5/0.5)를 부여한다.
///
/// # Arguments
/// * `pool`    - DB 커넥션 풀
/// * `user_id` - 사용자 ID
///
/// # Returns
/// * `Ok(())`      - 생성 성공
/// * `Err(String)` - 생성 실패
pub async fn create_default_preference(
    pool: &PgPool, 
    user_id: i32
) -> Result<(), String> {
    sqlx::query(
        "
        INSERT INTO user_preferences (
            id, 
            w_distance, 
            w_price
        )
        VALUES (
            $1, 
            0.5, 
            0.5
        )
        ON CONFLICT (id) 
        DO NOTHING
        ",
    )
    .bind(user_id)
    .execute(pool)
    .await
    .map_err(|e| format!("신규 유저 생성 실패: {}", e))?;

    Ok(())
}

/// 사용자 ID로 사용자의 가중치를 조회한다.
///
/// # Arguments
/// * `pool`    - DB 커넥션 풀
/// * `user_id` - 사용자 ID
///
/// # Returns
/// * `Ok(PreferenceEntity` - 사용자 가중치 정보
/// * `Err(String)`         - 조회 실패
pub async fn find_preference_by_user_id(
    pool: &PgPool,
    user_id: i32,
) -> Result<PreferenceEntity, String> {
    let preference = sqlx::query_as::<_, PreferenceEntity>(
        "
        SELECT * 
        FROM user_preferences 
        WHERE id = $1
        ",
    )
    .bind(user_id)
    .fetch_one(pool)
    .await
    .map_err(|e| format!("선호도 조회 실패: {}", e))?;

    Ok(preference)
}

/// 사용자가 매장을 선택 할 때마다 selection_count를 1 증가시킨다
///
/// # Arguments
/// * `pool`    - DB 커넥션 풀
/// * `user_id` - 사용자 ID
///
/// # Returns
/// * `Ok(i32)`     - 증가된 selection_count 값
/// * `Err(String)` - 업데이트 실패
pub async fn increment_selection_count(
    pool: &PgPool, 
    user_id: i32
) -> Result<i32, String> {
    let row = sqlx::query(
        "
        UPDATE user_preferences
        SET selection_count = selection_count + 1
        WHERE id = $1
        RETURNING selection_count
        ",
    )
    .bind(user_id)
    .fetch_one(pool)
    .await
    .map_err(|e| format!("selection 증가 실패: {}", e))?;

    let count: i32 = row.get("selection_count");

    Ok(count)
}

/// 사용자의 가중치(w_price, w_distance)를 업데이트한다.
/// 
/// # Arguments
/// * `pool`        - DB 커넥션 풀
/// * `user_id`     - 사용자 ID
/// * `w_price`     - 업데이트할 가격 가중치
/// * `w_distance`  - 업데이트할 거리 가중치
/// 
/// # Returns
/// * `Ok(())`      - 업데이트 성공
/// * `Err(string)` - 업데이트 실패
pub async fn update_user_weights(
    pool: &PgPool,
    user_id: i32,
    w_price: f64,
    w_distance: f64,
) -> Result<(), String> {
    sqlx::query(
        "
        UPDATE user_preferences
        SET 
            w_price = $1, 
            w_distance = $2
        WHERE id = $3
        ",
    )
    .bind(w_price)
    .bind(w_distance)
    .bind(user_id)
    .execute(pool)
    .await
    .map_err(|e| format!("가중치 업데이트 실패: {}", e))?;

    Ok(())
}
