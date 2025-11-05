use sqlx::PgPool;

use crate::common::entity::entity_region::RegionEntity;

pub async fn upsert_region_to_db(pool: &PgPool, region: &RegionEntity) -> Result<(), String> {
    sqlx::query_as::<_, RegionEntity>(
        "INSERT INTO regions (code, name, parent_code, level)
        VALUES ($1, $2, $3, $4)
        ON CONFLICT (code)
        DO NOTHING",
    )
    .bind(&region.code)
    .bind(&region.name)
    .bind(&region.parent_code)
    .bind(&region.level)
    .fetch_optional(pool)
    .await
    .map_err(|e| format!("지역코드 데이터 업데이트 실패: {}", e))?;

    Ok(())
}

pub async fn get_all_region_codes(pool: &PgPool) -> Result<Vec<RegionEntity>, String> {
    let rows = sqlx::query_as::<_, RegionEntity>
        ("SELECT * FROM regions")
    .fetch_all(pool)
    .await
    .map_err(|e| format!("쿼리 실패: {}", e))?;

    Ok(rows)
}