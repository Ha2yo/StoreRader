/************************************************************************
 * File: domain/price/service.rs
 * Description:
 *     가격(price) 도메인의 서비스 로직을 처리한다.
 *
 * Responsibilities:
 *     1) get_latest_prices()
 *         - 특정 상품명 기준으로 가장 최근 조사일의 가격 목록 조회
************************************************************************/

use sqlx::PgPool;

use crate::{
    common::repository::repository_join::find_latest_prices_by_good_name,
    domain::price::dto::dto_res::PriceRes,
};

/// 특정 상품명에 대해 가장 최근 조사일의 가격 정보를 조회한다.
/// 
/// # Arguments
/// * `pool`        - DB 커넥션 풀
/// * `good_name`   - 조회할 상품명
/// 
/// # Returns
/// * `Ok(Vec<PriceRes)`    - 매장별 최신 가격 목록
/// * `Err(String)`         - DB 조회 실패
pub async fn get_latest_prices(
    pool: &PgPool, 
    good_name: &str
) -> Result<Vec<PriceRes>, String> {
    find_latest_prices_by_good_name(pool, good_name).await
}
