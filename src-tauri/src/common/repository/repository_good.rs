/************************************************************************
 * File: common/repository/repository_good.rs
 * Description:
 *     goods 테이블에 대한 DB 연산 로직을 담당한다.
 *
 * Responsibilities:
 *     1) insert_or_update_good()  
 *         - 상품 정보 저장
 * 
 *     2) get_all_goods()          
 *         - 상품 정보 전체 조회
************************************************************************/

use sqlx::PgPool;

use crate::common::entity::entity_good::GoodEntity;

/// goods 테이블에 상품 정보를 저장한다.
/// 동일한 good_id가 존재하면 업데이트한다.
/// 
/// # Arguments
/// * `pool` - DB 커넥션 풀
/// * `good` - 저장 / 업데이트할 상품 엔터티
/// 
/// # Returns
/// * `Ok(())`        - 저장/업데이트 성공  
/// * `Err(String)`   - 삽입 실패
pub async fn insert_or_update_good (
    pool: &PgPool, 
    good: &GoodEntity
) -> Result<(), String> {
    sqlx::query(
        "
        INSERT INTO goods (
            good_id, 
            good_name, 
            total_cnt, 
            total_div_code
        )
        VALUES (
            $1, 
            $2, 
            $3, 
            $4
        )
        ON CONFLICT (good_id)
        DO UPDATE SET
            good_name = EXCLUDED.good_name,
            total_cnt = EXCLUDED.total_cnt,
            total_div_code = EXCLUDED.total_div_code,
            updated_at = NOW()
        ",
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

/// 전체 상품 목록을 조회한다.
/// 
/// # Arguments
/// * `pool` - DB 커넥션 풀
/// 
/// # Returns
/// * `Ok(Vec<GoodEntity>)` - 전체 상품 목록  
/// * `Err(String)`         - 조회 실패
pub async fn find_all_goods(
    pool: &PgPool
) -> Result<Vec<GoodEntity>, String> {
    let rows = sqlx::query_as::<_, GoodEntity>(
        "
        SELECT * FROM goods
        ORDER BY good_id::int ASC
        ",
    )
    .fetch_all(pool)
    .await
    .map_err(|e| format!("쿼리 실패: {}", e))?;

    Ok(rows)
}
