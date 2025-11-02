use sqlx::PgPool;

use crate::common::entity::entity_good::GoodEntity;

pub async fn upsert_good_to_db(pool: &PgPool, good: &GoodEntity) -> Result<(), String> {
    sqlx::query_as::<_, GoodEntity>(
    "INSERT INTO goods (good_id, good_name, total_cnt, total_div_code)
            VALUES ($1, $2, $3, $4)
            ON CONFLICT (good_id)
            DO UPDATE SET
                good_name = EXCLUDED.good_name,
                total_cnt = EXCLUDED.total_cnt,
                total_div_code = EXCLUDED.total_div_code,
                updated_at = NOW()",
    )
    .bind(&good.good_id)
    .bind(&good.good_name)
    .bind(good.total_cnt)
    .bind(&good.total_div_code)
    .fetch_optional(pool)
    .await
    .map_err(|e| format!("상품 데이터 업데이트 실패: {}", e))?;

    Ok(())
}

pub async fn get_all_goods(pool: &PgPool) -> Result<Vec<GoodEntity>, String> {
    let rows = sqlx::query_as::<_, GoodEntity>
        ("SELECT *FROM goods")
    .fetch_all(pool)
    .await
    .map_err(|e| format!("쿼리 실패: {}", e))?;

    Ok(rows)
}
