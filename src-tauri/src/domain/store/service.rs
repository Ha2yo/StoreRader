/************************************************************************
 * File: domain/store/service.rs
 * Description:
 *     매장(store) 도메인의 서비스 로직을 처리한다.
 *
 * Responsibilities:
 *     1) get_all_goods()
 *         - stores 테이블 전체를 조회하여 반환
************************************************************************/
use axum::Json;
use sqlx::PgPool;

use crate::{common::repository::repository_store, domain::store::dto::dto_res::StoreRes};

/// 전체 매장 (stores) 목록을 조회하여 클라이언트로 반환한다
/// 
/// # Arguments
/// * `pool` - DB 커넥션 풀
/// 
/// # Returns
/// * `Ok(Json<Vec<GoodRes>)`   - 전체 매장 목록 
/// * `Err(String)`             - 조회 실패
pub async fn get_all_stores(
    pool: &PgPool
) -> Result<Json<Vec<StoreRes>>, String> {
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
            area_code: s.area_code,
            area_detail_code: s.area_detail_code,
        })
        .collect::<Vec<StoreRes>>();

    Ok(Json(result))
}
