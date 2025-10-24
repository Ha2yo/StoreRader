/***********************************************************
 auth/dto/req.rs는 클라이언트에서 서버로 전달되는
 인증 관련 요청 데이터를 정의한다

 1. GoogleLoginReq
    - 클라이언트가 Google OAuth 로그인 시 전송하는 요청 데이터
    - 필드:
      id_token: Google에서 발급한 ID 토큰
      clint_id: 앱의 Google OAuth Client ID
***********************************************************/

use serde::Deserialize;

#[derive(Deserialize)]
pub struct GoogleLoginReq {
    pub id_token: String,
    pub client_id: String,
}