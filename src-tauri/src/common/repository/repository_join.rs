use sqlx::PgPool;
use crate::domain::price::dto::dto_res::PriceRes;

pub async fn find_latest_prices_by_good_name(
    pool: &PgPool,
    good_name: &str,
) -> Result<Vec<PriceRes>, String> {
    let result = sqlx::query_as::<_, PriceRes>(
        r#"
        SELECT p.store_id, p.price, p.inspect_day
        FROM prices p
        JOIN (
            SELECT store_id, MAX(inspect_day) AS latest_day
            FROM prices
            WHERE good_id = (
                SELECT good_id FROM goods WHERE good_name = $1 LIMIT 1
            )
            GROUP BY store_id
        ) latest
        ON p.store_id = latest.store_id AND p.inspect_day = latest.latest_day
        WHERE p.good_id = (
            SELECT good_id FROM goods WHERE good_name = $1 LIMIT 1
        )
        "#
    )
    .bind(good_name)
    .fetch_all(pool)
    .await
    .map_err(|e| format!("가격 데이터 조회 실패: {}", e))?;

    Ok(result)
}
