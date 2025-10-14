use jsonwebtoken::{decode, decode_header, Algorithm, DecodingKey, Validation};
use reqwest;
use serde::{Deserialize, Serialize};

// Google ID Token Claims 구조체
#[derive(Serialize, Deserialize)]
pub struct GoogleClaims {
    pub iss: String,          // 발급자
    pub sub: String,          // 고유 ID
    pub aud: String,          // 수신자 (clientId)
    pub email: String,        // 유저 이메일
    pub email_verified: bool, // 이메일 인증 여부
    pub exp: usize,           // 만료 시각
    pub iat: usize,           // 발급 시각
    pub name: String,         // 유저 이름
    pub picture: String,      // 프로필 사진 URL
}

// 구글 공개키 (JWK) 구조체
#[derive(Deserialize)]
struct Jwk {
    kid: String, // Key ID
    n: String,
    e: String,
}

#[derive(Deserialize)]
struct JwkResponse {
    keys: Vec<Jwk>,
}

// 구글 ID Token 검증 함수
pub async fn verify_google_id_token(
    id_token: String,
    client_id: String,
) -> Result<GoogleClaims, String> {
    // JWT 헤더에서 서명에 사용된 키 (kid) 추출
    let header = decode_header(&id_token).map_err(|e| format!("헤더 파싱 실패: {}", e))?;
    let kid = header.kid.ok_or("헤더에 kid 없음")?;

    // 구글 서버에서 JWKS (공개키 세트) 받아오기
    let resp = reqwest::get("https://www.googleapis.com/oauth2/v3/certs")
        .await
        .map_err(|e| format!("JWKS 요청 실패: {}", e))?;
    let jwks: JwkResponse = resp
        .json()
        .await
        .map_err(|e| format!("JWKS JSON 파싱 실패: {}", e))?;

    // kid가 일치하는 공개키 찾기
    let jwk = jwks
        .keys
        .into_iter()
        .find(|key| key.kid == kid)
        .ok_or("일치하는 공개키 없음")?;

    // RSA 검증용 키 생성
    let decoding_key = DecodingKey::from_rsa_components(&jwk.n, &jwk.e)
        .map_err(|e| format!("RSA 키 생성 실패: {}", e))?;

    // 발신자와 수신자 확인
    let mut validation = Validation::new(Algorithm::RS256);
    validation.set_audience(&[client_id.as_str()]);
    validation.set_issuer(&["https://accounts.google.com"]);

    // 토큰 검증 및 해독
    let decoded = decode::<GoogleClaims>(&id_token, &decoding_key, &validation)
        .map_err(|e| format!("ID Token 검증 실패: {}", e))?;

    Ok(decoded.claims)
}
