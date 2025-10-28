/***********************************************************
 auth/dto/res.rs는 서버에서 클라이언트로 전달되는
 인증 관련 응답 데이터를 정의한다

 1. UserRes
    - 사용자 정보 응답 구조체
    - 필드:
      id: 사용자 고유 ID
      name: 사용자 이름
      email: 사용자 이메일

 2. GoogleLoginRes
    - Google 로그인 요청에 대한 서버 응답 구조체
    - 필드:
      jwt: 서버에서 발급한 JWT 토큰
      usre: 로그인된 사용자 정보 (UserRes)
***********************************************************/

use serde::Serialize;

#[derive(Serialize)]
pub struct UserRes {
    pub id: i32,
    pub name: String,
    pub email: String,
}

#[derive(Serialize)]
pub struct GoogleLoginRes {
    pub jwt: String,
    pub user: UserRes,
}