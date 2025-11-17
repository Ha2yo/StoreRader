/************************************************************************
 * File: common/repository/price_change.rs
 * Description:
 *     price_change 테이블에 대한 DB 연산 로직을 담당한다.
 *
 * Responsibilities:
 *     1) insert_price_change() 
 *         - 가격 변화 이력 생성
************************************************************************/

use sqlx::PgPool;

/// 두 날짜 (latest, prev)를 기준으로 price_change 테이블에
/// 가격 변동 이력을 일괄 삽입한다.
/// 
/// # Arguments
/// * `pool`    - DB 커넥션 풀
/// * `latest`  - 최근 조사일 (YYYYMMDD)
/// * `prev`    - 비교 대상 이전 조사일 (YYYYMMDD)
/// 
/// # Returns
/// * `Ok(i32)`     
/// * `Err(String)`
pub async fn insert_price_change(
    pool: &PgPool, 
    latest: &str, 
    prev: &str
) -> Result<i32, String> {
    let rows = sqlx::query(
        "
        INSERT INTO price_change (
            good_id, 
            store_id, 
            previous_price, 
            current_price, 
            diff, 
            inspect_day)
        WITH latest AS (
            SELECT 
                good_id, 
                store_id, 
                price AS current_price
            FROM prices
            WHERE inspect_day = $1
        ),
        prev AS (
            SELECT 
                good_id, 
                store_id, 
                price AS previous_price
            FROM prices
            WHERE inspect_day = $2
        )
        SELECT
            l.good_id,
            l.store_id,
            p.previous_price,
            l.current_price,
            (l.current_price - p.previous_price) AS diff,
            $1
        FROM latest l
        JOIN prev p
            ON l.good_id = p.good_id
           AND l.store_id = p.store_id
        "
    )
    .bind(latest)
    .bind(prev)
    .execute(pool)
    .await
    .map_err(|e| format!("price_change insert 실패: {}", e))?;

    let count = rows.rows_affected() as i32;

    Ok(count)
}
