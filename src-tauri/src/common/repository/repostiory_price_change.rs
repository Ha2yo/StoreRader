use sqlx::PgPool;

pub async fn insert_price_change(
    pool: &PgPool,
    latest: &str,
    prev: &str
) -> Result<u64, String> {

    let rows = sqlx::query(
        "
        INSERT INTO price_change (good_id, store_id, previous_price, current_price, diff, inspect_day)
        WITH latest AS (
            SELECT good_id, store_id, price AS current_price
            FROM prices
            WHERE inspect_day = $1
        ),
        prev AS (
            SELECT good_id, store_id, price AS previous_price
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


    Ok(rows.rows_affected())
}