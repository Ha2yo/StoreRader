/************************************************************************
 * File: common/repository/user.rs
 * Description:
 *     users 테이블에 대한 DB 연산 로직을 담당한다.
 *
 * Responsibilities:
 *     1) find_and_create_user()    
 *         - 사용자를 조회하거나 신규 생성
 * 
 *     2) update_last_login()       
 *         - last_login 갱신
 * 
 *     3) create_user()             
 *         - 신규 사용자 생성
************************************************************************/

use sqlx::PgPool;

use crate::common::entity::entity_user::UserEntity;

/// sub(고유 식별자)로 사용자를 조회한다.
/// 
/// # Arguments
/// * `pool`    - DB 커넥션 풀
/// * `sub`     - Google OAuth 고유 식별자
/// 
/// # Returns
/// * `Ok(UserEntity)`  - 조회 성공
/// * `Err(String)`     - 조회 실패
pub async fn find_user_by_sub(
    pool: &PgPool, 
    sub: &str
) -> Result<UserEntity, String> {
    let rows = sqlx::query_as::<_, UserEntity>(
        "
        SELECT * 
        FROM users 
        WHERE sub = $1
        ",
    )
    .bind(sub)
    .fetch_one(pool)
    .await
    .map_err(|e| format!("사용자 조회 실패: {}", e))?;

    Ok(rows)
}

/// 사용자의 last_login을 현재 시각으로 갱신하다.
/// 
/// # Arguments
/// * `pool`    - DB 커넥션 풀
/// * `sub`     - Google OAuth 고유 식별자
/// 
/// # Returns
/// * `Ok(())`      - 갱신 성공
/// * `Err(String)` - 갱신 실패
pub async fn update_last_login(
    pool: &PgPool, 
    sub: &str
) -> Result<(), String> {
    sqlx::query(
        "
        UPDATE users 
        SET last_login = NOW() 
        WHERE sub = $1
        ",
    )
    .bind(sub)
    .execute(pool)
    .await
    .map_err(|e| format!("last_login 업데이트 실패: {}", e))?;

    Ok(())
}

/// 사용자의 이름(name)을 최신 Google OAuth 정보로 갱신한다.
///
/// # Arguments
/// * `pool` - DB 커넥션 풀
/// * `sub`  - Google OAuth 고유 식별자
/// * `new_name` - Google 계정에서 가져온 최신 이름
///
/// # Returns
/// * `Ok(())`      - 갱신 성공
/// * `Err(String)` - 갱신 실패
pub async fn update_user_name(
    pool: &PgPool,
    sub: &str,
    new_name: &str,
) -> Result<(), String> {
    sqlx::query(
        r#"
        UPDATE users 
        SET name = $1
        WHERE sub = $2
        "#,
    )
    .bind(new_name)
    .bind(sub)
    .execute(pool)
    .await
    .map_err(|e| format!("이름 업데이트 실패: {}", e))?;

    Ok(())
}

/// 신규 사용자를 생성한다.
/// 
/// # Arguments
/// * `pool`    - DB 커넥션 풀
/// * `sub`     - Google OAuth 고유 식별자
/// * `email`   - 사용자 이메일
/// * `name`    - 사용자 이름
/// 
/// # Returns
/// * `Ok(UserEntity)`  - 생성된 사용자 엔터티
/// * Err(String)       - 생성 실패
pub async fn create_user(
    pool: &PgPool,
    sub: &str,
    email: &str,
    name: &str,
) -> Result<UserEntity, String> {
    let rows = sqlx::query_as::<_, UserEntity>(
        "
        INSERT INTO users (
            sub, 
            email, 
            name
        ) 
        VALUES (
            $1, 
            $2, 
            $3
        )
         RETURNING 
            id, 
            sub, 
            email, 
            name, 
            created_at, 
            last_login
        ",
    )
    .bind(sub)
    .bind(email)
    .bind(name)
    .fetch_one(pool)
    .await
    .map_err(|e| format!("신규 사용자 생성 실패: {}", e))?;

    Ok(rows)
}
