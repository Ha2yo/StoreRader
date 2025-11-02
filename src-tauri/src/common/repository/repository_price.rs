use sqlx::PgPool;
use crate::common::entity::entity_price::PriceEntity;

/// 가격 정보를 DB에 upsert
pub async fn upsert_price_to_db(pool: &PgPool, price: &PriceEntity) -> Result<(), String> {
    sqlx::query_as::<_, PriceEntity>(
    "INSERT INTO prices
        (good_id, store_id, inspect_day, price, is_one_plus_one, is_discount, discount_start, discount_end, created_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())
        ON CONFLICT (good_id, store_id, inspect_day)
        DO UPDATE SET
            price = EXCLUDED.price,
            is_one_plus_one = EXCLUDED.is_one_plus_one,
            is_discount = EXCLUDED.is_discount,
            discount_start = EXCLUDED.discount_start,
            discount_end = EXCLUDED.discount_end,
            created_at = NOW()",
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
