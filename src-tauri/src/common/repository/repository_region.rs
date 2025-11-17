/************************************************************************
 * File: common/repository/repository_region.rs
 * Description:
 *     regions 테이블에 대한 DB 연산 로직을 담당한다.
 *
 * Responsibilities:
 *     1) insert_region_codes_if_not_exists()   
 *         - 지역 코드 저장
 * 
 *     2) get_all_region_codes()                
 *         - 전체 지역 코드 조회
************************************************************************/

use sqlx::PgPool;

use crate::common::entity::entity_region::RegionEntity;

/// 지역 코드를 DB에 삽입한다
/// 
/// # Arguments
/// * `pool`    - DB 커넥션 풀
/// * `regions` - 저장할지역 코드 엔터티
/// 
/// # Returns
/// * `Ok(())`      - 저장 성공
/// * `Err(String)` - 쿼리 실패
pub async fn insert_region_codes_if_not_exists(
    pool: &PgPool, 
    region: &RegionEntity
) -> Result<(), String> {
    sqlx::query_as::<_, RegionEntity>(
        "
        INSERT INTO regions (
            code, 
            name, 
            parent_code, 
            level
        )
        VALUES (
            $1, 
            $2, 
            $3, 
            $4
        )
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

/// 전체 지역 코드 목록을 조회한다.
/// 
/// # Arguments
/// * `pool` - DB 커넥션 풀
/// 
/// * Returns
/// * `Ok(Vec<RegionEntity>)`   - 지역 코드 전체 목록
/// * `Err(String)`             - 조회 실패
pub async fn get_all_region_codes(
    pool: &PgPool
) -> Result<Vec<RegionEntity>, String> {
    let rows = sqlx::query_as::<_, RegionEntity>(
        "
        SELECT * 
        FROM regions
        ORDER BY code::int ASC
        ",
    )
    .fetch_all(pool)
    .await
    .map_err(|e| format!("쿼리 실패: {}", e))?;

    Ok(rows)
}
