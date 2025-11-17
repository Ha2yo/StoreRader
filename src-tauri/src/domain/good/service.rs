/************************************************************************
 * File: domain/good/service.rs
 * Description:
 *     상품(good) 도메인의 서비스 로직을 처리한다.
 *
 * Responsibilities:
 *     1) get_all_goods()
 *         - goods 테이블 전체를 조회하여 반환
************************************************************************/

use axum::Json;
use sqlx::PgPool;

use crate::{common::repository::repository_good, domain::good::dto::dto_res::GoodRes};

/// 전체 상품 목록을 조회하여 클라이언트로 반환한다
/// 
/// # Arguments
/// * `pool` - DB 커넥션 풀
/// 
/// # Returns
/// * `Ok(Json<Vec<GoodRes>)`   - 전체 상품 목록 
/// * `Err(String)`             - 조회 실패
pub async fn get_all_goods(
    pool: &PgPool
) -> Result<Json<Vec<GoodRes>>, String> {
    let goods = repository_good::find_all_goods(pool)
        .await
        .map_err(|e| format!("DB 조회 실패: {}", e))?;

    let result = goods
        .into_iter()
        .map(|g| GoodRes {
            id: g.id,
            good_id: g.good_id,
            good_name: g.good_name,
            total_cnt: g.total_cnt,
            total_div_code: g.total_div_code,
            created_at: g.created_at,
            updated_at: g.created_at,
        })
        .collect::<Vec<GoodRes>>();

    Ok(Json(result))
}
