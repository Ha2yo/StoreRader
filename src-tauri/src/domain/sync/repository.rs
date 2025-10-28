use sqlx::PgPool;
use crate::domain::sync::entity::{good_entity::GoodEntity, store_entity::StoreEntity};

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

pub async fn upsert_store_to_db(pool: &PgPool, store: &StoreEntity) -> Result<(), String> {
    sqlx::query_as::<_, StoreEntity>(
    "INSERT INTO stores (
    store_id, store_name, tel_no, post_no, plmk_addr, road_addr, x_coord, y_coord
    )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        ON CONFLICT (store_id)
        DO UPDATE SET
            store_name = EXCLUDED.store_name,
            tel_no = EXCLUDED.tel_no,
            post_no = EXCLUDED.post_no,
            plmk_addr = EXCLUDED.plmk_addr,
            road_addr = EXCLUDED.road_addr,
            x_coord = EXCLUDED.x_coord,
            y_coord = EXCLUDED.y_coord,
            updated_at = NOW()",
    )
    .bind(&store.store_id)
    .bind(&store.store_name)
    .bind(&store.tel_no)
    .bind(&store.post_no)
    .bind(&store.plmk_addr)
    .bind(&store.road_addr)
    .bind(&store.x_coord)
    .bind(&store.y_coord)
    .fetch_optional(pool)
    .await
    .map_err(|e| format!("매장 데이터 업데이트 실패: {}", e))?;

    Ok(())
}