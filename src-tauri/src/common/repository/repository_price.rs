/************************************************************************
 * File: common/repository/repository_price.rs
 * Description:
 *     prices 테이블에 대한 DB 연산 로직을 담당한다.
 *
 * Responsibilities:
 *     1) insert_or_update_price() 
 *         - 가격 정보 저장
 * 
 *     2) find_prev_day()          
 *         - 기준일 이전의 가장 최근 inspect_day 조회
************************************************************************/

use crate::common::entity::entity_price::PriceEntity;
use sqlx::Row;
use sqlx::{PgPool, Result};

/// prices 테이블에 가격 정보를 저장한다.
/// 동일한 (good_id, store_id, inspect_day) 조합이 존재하면 업데이트한다.
/// 
/// # Arguments
/// * `pool` - DB 커넥션 풀
/// * `price` - 저장 / 업데이트할 가격 엔터티
/// 
/// # Returns
/// * `Ok(())`        - 저장/업데이트 성공  
/// * `Err(String)`   - 삽입 실패
pub async fn insert_price_to_db(
    pool: &PgPool, 
    price: &PriceEntity
) -> Result<(), String> {
    sqlx::query_as::<_, PriceEntity>(
        "
        INSERT INTO prices(
            good_id, 
            store_id, 
            inspect_day, 
            price, 
            is_one_plus_one, 
            is_discount, 
            discount_start, 
            discount_end, 
            created_at
        )
        VALUES (
            $1, 
            $2, 
            $3, 
            $4, 
            $5, 
            $6, 
            $7, 
            $8, 
            NOW()
        )
        ON CONFLICT (
            good_id, 
            store_id, 
            inspect_day
        )
        DO UPDATE SET
            price = EXCLUDED.price,
            is_one_plus_one = EXCLUDED.is_one_plus_one,
            is_discount = EXCLUDED.is_discount,
            discount_start = EXCLUDED.discount_start,
            discount_end = EXCLUDED.discount_end,
            created_at = NOW()
        ",
    )
    .bind(&price.good_id)
    .bind(&price.store_id)
    .bind(&price.inspect_day)
    .bind(&price.price)
    .bind(&price.is_one_plus_one)
    .bind(&price.is_discount)
    .bind(&price.discount_start)
    .bind(&price.discount_end)
    .fetch_optional(pool)
    .await
    .map_err(|e| format!("가격 데이터 업데이트 실패: {}", e))?;

    Ok(())
}

/// 기준일(latest_day)보다 이전 날짜 중 가장 최근의 inspect_day 값을 조회한다.
/// 
/// # Arguments
/// * `pool`        - DB 커넥션 풀
/// * `latest_day`  - 기준 날짜(YYYYMMDD)
/// 
/// # Returns
/// * `Ok(Some(String))`    - 이전 inspect_day 조회 성공
/// * `Err(String)`         - 조회 실패
pub async fn find_prev_day(
    pool: &PgPool, 
    latest_day: &str
) -> Result<String, String> {
    let row = sqlx::query(
        "
        SELECT 
            inspect_day
        FROM prices
        WHERE inspect_day < $1
        ORDER BY inspect_day DESC
        LIMIT 1
        ",
    )
    .bind(latest_day)
    .fetch_one(pool)
    .await
    .map_err(|e| format!("가격 데이터 업데이트 실패: {}", e))?;

    let prev_day = row.get::<String, _>("inspect_day");

    Ok(prev_day)
}
