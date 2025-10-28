/***********************************************************
 entity/users.rs는 users 테이블과 매핑되는
 엔티티 구조체를 정의한다

 1. User
    - DB의 users 테이블 행을 표현
    - 필드:
      id: 사용자 고유 ID (PK)
      sub: Google OAuth 고유 식별자
      email: 사용자 이메일
      name: 사용자 이름
      created_at: 계정 생성 시각
      last_login: 마지막 로그인 시각
***********************************************************/

use chrono::NaiveDateTime;
use sqlx::prelude::FromRow;

#[derive(Debug, FromRow, Clone)]
pub struct UserEntity {
    pub id: i32,
    pub sub: String,
    pub email: String,
    pub name: String,
    pub created_at: NaiveDateTime,
    pub last_login: NaiveDateTime,
}