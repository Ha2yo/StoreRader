use sqlx::PgPool;

use crate::common::entity::entity_store::StoreEntity;

pub async fn upsert_store_to_db(pool: &PgPool, store: &StoreEntity) -> Result<(), String> {
    sqlx::query_as::<_, StoreEntity>(
    "INSERT INTO stores (
    store_id, store_name, tel_no, post_no, jibun_addr, road_addr, x_coord, y_coord
    )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        ON CONFLICT (store_id)
        DO UPDATE SET
            store_name = EXCLUDED.store_name,
            tel_no = EXCLUDED.tel_no,
            post_no = EXCLUDED.post_no,
            jibun_addr = EXCLUDED.jibun_addr,
            road_addr = EXCLUDED.road_addr,
            x_coord = EXCLUDED.x_coord,
            y_coord = EXCLUDED.y_coord,
            updated_at = NOW()",
    )
    .bind(&store.store_id)
    .bind(&store.store_name)
    .bind(&store.tel_no)
    .bind(&store.post_no)
    .bind(&store.jibun_addr)
    .bind(&store.road_addr)
    .bind(&store.x_coord)
    .bind(&store.y_coord)
    .fetch_optional(pool)
    .await
    .map_err(|e| format!("매장 데이터 업데이트 실패: {}", e))?;

    Ok(())
}


pub async fn get_all_stores(pool: &PgPool) -> Result<Vec<StoreEntity>, String> {
    let rows = sqlx::query_as::<_, StoreEntity>
        ("
        SELECT * FROM stores
        WHERE x_coord IS NOT NULL AND y_coord IS NOT NULL
        ")
    .fetch_all(pool)
    .await
    .map_err(|e| format!("쿼리 실패: {}", e))?;

    Ok(rows)
}
