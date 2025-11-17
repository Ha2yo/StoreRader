/************************************************************************
 * File: domain/price_change/service.rs
 * Description:
 *     가격 변동(price_change) 도메인의 서비스 로직을 처리한다.
 *
 * Responsibilities:
 *     1) upsert_price_change()
 *         - 최근 조사일과 이전 조사일의 가격을 비교하여
 *           변동 결과를 price_change 테이블에 저장
 * 
 *     2) get_price_change()
 *         - 가격 변동 데이터를 조회하여 반환한다.
************************************************************************/

use sqlx::PgPool;

use crate::{
    common::repository::{repository_join::{fetch_price_rise_top, find_price_drop_top}, repository_price::find_prev_day, repostiory_price_change::insert_price_change},
    domain::price_change::dto::dto_res::PriceTrendRes,
};

/// 상품 정보를 API로부터 가져와 goods 테이블에 저장/갱신한다.
/// 
/// # Arguments
/// * `pool` - DB 커넥션 풀
/// 
/// # Returns
/// * `Ok(())`      - 저장 완료
/// * `Err(String)` - 저장 실패
pub async fn upsert_price_change(pool: &PgPool, latest_day: &str) -> Result<String, String> {
    // inpece_day 기준 prev_day 조회
    let prev_day = find_prev_day(pool, latest_day)
        .await
        .map_err(|e| format!("prev_day 조회 실패: {}", e))?;

    let inserted_count = insert_price_change(pool, latest_day, &prev_day).await?;

    Ok(format!(
        "price_change 생성 완료: latest={}, prev={}, inserted={}",
        latest_day, prev_day, inserted_count
    ))
}

/// 가격 변동 정보를 조회한다.
/// 
/// # Arguments
/// * `pool`    - DB 커넥션 풀
/// * `status`  - 조회 타입 ("up" | "down")
/// 
/// # Returns
/// * `Ok(Vec<PriceTrendRes>)`  - 상품별 가격 변동 요약 목록
/// * `Err(String)`             - 조회 실패
pub async fn get_price_change(
    pool: &PgPool,
    status: &String,
) -> Result<Vec<PriceTrendRes>, String> {
    match status.as_str() {
        "down" => find_price_drop_top(pool).await,
        "up" => fetch_price_rise_top(pool).await,
        _ => find_price_drop_top(pool).await,
    }
}
