use axum::Json;
use sqlx::PgPool;

use crate::{common::repository::repository_region, domain::region::dto::dto_res::RegionCodeRes};

pub async fn get_all_region_codes(pool: &PgPool) -> Result<Json<Vec<RegionCodeRes>>, String> {
    let stores = repository_region::get_all_region_codes(pool)
        .await
        .map_err(|e| format!("DB 조회 실패: {}", e))?;

    let result = stores
        .into_iter()
        .map(|r| RegionCodeRes {
            code: r.code,
            name: r.name,
            parent_code: r.parent_code,
            level: r.level,
        })
        .collect::<Vec<RegionCodeRes>>();

    Ok(Json(result))
}
