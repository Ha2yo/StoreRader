/************************************************************************
 * File: domain/region_code/service.rs
 * Description:
 *     상품(good) 도메인의 서비스 로직을 처리한다.
 *
 * Responsibilities:
 *     1) get_all_goods()
 *         - goods 테이블 전체를 조회하여 반환
************************************************************************/
use axum::Json;
use sqlx::PgPool;

use crate::{
    common::repository::repository_region, domain::region_code::dto::dto_res::RegionCodeRes,
};

/// 전체 지역 코드 목록을 조회하여 클라이언트로 반환한다
/// 
/// # Arguments
/// * `pool` - DB 커넥션 풀
/// 
/// # Returns
/// * `Ok(Json<Vec<RegionCodeRes>)` - 지역 코드 목록 
/// * `Err(String)`                 - 조회 실패
pub async fn get_all_region_codes(
    pool: &PgPool
) -> Result<Json<Vec<RegionCodeRes>>, String> {
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
