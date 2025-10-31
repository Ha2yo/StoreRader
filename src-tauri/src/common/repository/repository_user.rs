/***********************************************************
 repository/user.rs는 users 테이블과 관련된 
 데이터베이스 접근 로직을 관리한다

 1. find_and_create_user()
    - sub(고유 식별자)로 기존 사용자를 조회
    - 존재 시 last_login을 갱신
    - 존재하지 않으면 신규 사용자 INSERT 후 반환

 2. get_user_by_sub()
    - sub(고유 식별자)를 기반으로 사용자 단일 조회
***********************************************************/

use sqlx::{PgPool, Error};

use crate::common::entity::entity_user::UserEntity;


// find_and_create_user()
// 기능: sub로 사용자 조회 후 없으면 생성 (있으면 last_login 갱신)
// 입력: pool(DB 연결), sub(식별자), email, name
// 출력: 사용자 정보(User) or 에러 메시지(String)
pub async fn find_and_create_user(
    pool: &PgPool,
    sub: &str,
    email: &str,
    name: &str,
) -> Result<UserEntity, String> {

    // 기존 유저 조회
    match sqlx::query_as::<_, UserEntity>("SELECT * FROM users WHERE sub = $1")
        .bind(sub)
        .fetch_one(pool)
        .await
    {
        Ok(mut user) => {
            // 로그인 시간 업데이트
            sqlx::query("UPDATE users SET last_login = NOW() WHERE sub = $1")
                .bind(sub)
                .execute(pool)
                .await
                .map_err(|e| format!("last_login 업데이트 실패: {}", e))?;

            user.last_login = chrono::Utc::now().naive_utc();
            return Ok(user);
        }
        Err(Error::RowNotFound) => {
        }
        Err(e) => {
            return Err(format!("DB 조회 실패: {}", e));
        }
    }

    // 신규 유저 생성
    let new_user = sqlx::query_as::<_, UserEntity>(
        "INSERT INTO users (sub, email, name) VALUES ($1, $2, $3)
         RETURNING id, sub, email, name, created_at, last_login",
    )
    .bind(sub)
    .bind(email)
    .bind(name)
    .fetch_one(pool)
    .await
    .map_err(|e| format!("신규 유저 생성 실패: {}", e))?;

    Ok(new_user)
}



// get_user_by_sub()
// 기능: sub(식별자)로 단일 사용자 조회
// 입력: pool(DB 연결), sub(식별자)
// 출력: 사용자 정보(User) or 에러 메시지(String)
pub async fn get_user_by_sub(
    pool: &PgPool, 
    sub: &str
) -> Result<UserEntity, String> {
    let user = sqlx::query_as::<_, UserEntity>("SELECT * FROM users WHERE sub = $1")
        .bind(sub)
        .fetch_one(pool)
        .await
        .map_err(|e| format!("DB 조회 실패: {}", e))?;

    Ok(user)
}