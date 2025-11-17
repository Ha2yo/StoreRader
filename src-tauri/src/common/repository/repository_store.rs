/************************************************************************
 * File: common/repository/repository_store.rs
 * Description:
 *     stores 테이블에 대한 DB 연산 로직을 담당한다.
 *
 * Responsibilities:
 *     1) insert_or_update_store()  
 *         - 매장 정보 저장
 * 
 *     2) get_all_store_id()        
 *         - 전체 매장 ID 목록 조회
 * 
 *     3) get_all_stores()          
 *         - 좌표가 존재하는 전체 매장 조회
************************************************************************/

use sqlx:: {PgPool, Row};

use crate::common::entity::entity_store::StoreEntity;

/// stores 테이블에 매장 정보를 저장한다.
/// 동일한 store_id가 존재하면 업데이트한다.
///
/// # Arguments
/// * `pool`    - DB 커넥션 풀
/// * `store`   - 저장 / 업데이트할 매장 엔터티
/// 
/// # Returns
/// * `Ok(())`        - 저장/업데이트 성공  
/// * `Err(String)`   - 삽입 실패
pub async fn insert_or_update_store(
    pool: &PgPool, 
    store: &StoreEntity
) -> Result<(), String> {
    sqlx::query_as::<_, StoreEntity>(
        "
        INSERT INTO stores (
            store_id, 
            store_name, 
            tel_no, post_no, 
            jibun_addr, 
            road_addr, 
            x_coord, 
            y_coord, 
            area_code, 
            area_detail_code
        )
        VALUES (
            $1, 
            $2, 
            $3, 
            $4, 
            $5, 
            $6, 
            $7, 
            $8, 
            $9, 
            $10
        )
        ON CONFLICT (store_id)
        DO UPDATE SET
            store_name = EXCLUDED.store_name,
            tel_no = EXCLUDED.tel_no,
            post_no = EXCLUDED.post_no,
            jibun_addr = EXCLUDED.jibun_addr,
            road_addr = EXCLUDED.road_addr,
            x_coord = EXCLUDED.x_coord,
            y_coord = EXCLUDED.y_coord,
            updated_at = NOW(),
            area_code = EXCLUDED.area_code,
            area_detail_code = EXCLUDED.area_detail_code
        ",
    )
    .bind(&store.store_id)
    .bind(&store.store_name)
    .bind(&store.tel_no)
    .bind(&store.post_no)
    .bind(&store.jibun_addr)
    .bind(&store.road_addr)
    .bind(&store.x_coord)
    .bind(&store.y_coord)
    .bind(&store.area_code)
    .bind(&store.area_detail_code)
    .fetch_optional(pool)
    .await
    .map_err(|e| format!("매장 데이터 업데이트 실패: {}", e))?;

    Ok(())
}

/// 전체 매장의 store_id를 조회한다.
/// 
/// # Arguments
/// * `pool` - DB 커넥션 풀
/// 
/// # Returns
/// * `Ok(Vec<String>)` - store_id 리스트
/// * `Err(String)`     - 조회 실패
pub async fn get_all_stores_id(
    pool: &PgPool
) -> Result<Vec<String>, String> {
    let rows = sqlx::query(
        "
        SELECT store_id 
        FROM stores
        ORDER BY store_id::bigint ASC
        ",
    )
    .fetch_all(pool)
    .await
    .map_err(|e| format!("매장 목록 조회 실패: {}", e))?;

    let ids = rows
        .into_iter()
        .map(|row| row.get::<String, _>("store_id"))
        .collect();
    Ok(ids)
}


/// 좌표가 존재하는 전체 매장 목록을 조회한다.
/// 
/// # Arguments
/// * `pool` - DB 커넥션 풀
/// 
/// # Returns
/// * `Ok(<Vec<StoreEntity>)`   - 매장 목록
/// * `Err(String)`             - 조회 실패
pub async fn get_all_stores(
    pool: &PgPool
) -> Result<Vec<StoreEntity>, String> {
    let rows = sqlx::query_as::<_, StoreEntity>(
        "
        SELECT * 
        FROM stores
        WHERE x_coord IS NOT NULL 
            AND y_coord IS NOT NULL
        ORDER BY store_id::bigint ASC
        ",
    )
    .fetch_all(pool)
    .await
    .map_err(|e| format!("쿼리 실패: {}", e))?;

    Ok(rows)
}
