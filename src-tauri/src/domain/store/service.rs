use axum::Json;
use sqlx::PgPool;

use crate::{common::repository::repository_store, domain::store::dto::dto_res::StoreRes};

pub async fn get_all_stores(pool: &PgPool) -> Result<Json<Vec<StoreRes>>, String> {
    let stores = repository_store::get_all_stores(pool)
        .await
        .map_err(|e| format!("DB 조회 실패: {}", e))?;

    let result = stores
        .into_iter()
        .map(|s| StoreRes {
            id: s.id,
            store_id: s.store_id,
            store_name: s.store_name,
            tel_no: s.tel_no,
            post_no: s.post_no,
            jibun_addr: s.jibun_addr,
            road_addr: s.road_addr,
            x_coord: s.x_coord,
            y_coord: s.y_coord,
            created_at: s.created_at.to_string(),
            updated_at: s.updated_at.to_string(),
        })
        .collect::<Vec<StoreRes>>();

    Ok(Json(result))
}
