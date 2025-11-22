use serde::Serialize;

/// 로그인된 사용자 정보를 나타내는 응답 DTO
/// 
/// # Fields
/// * `id`    - 사용자 고유 ID (DB PK)
/// * `name`  - 사용자 이름
/// * `email` - 사용자 이메일
#[derive(Serialize)]
pub struct UserRes {
    pub id: i32,
    pub name: String,
    pub email: String,
    pub picture: String,
}

/// Google 로그인 처리 결과로 반환되는 응답 DTO
/// 
/// # Fields
/// * `jwt`   - 서버가 발급한 인증용 JWT
/// * `user`  - 로그인된 사용자 정보 (`UserRes`)
#[derive(Serialize)]
pub struct GoogleLoginRes {
    pub jwt: String,
    pub user: UserRes,
}