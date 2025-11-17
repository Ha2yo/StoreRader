use serde::Deserialize;

/// Google JWKS 내부의 개별 공개키 구조이다.
/// 
/// # Fields
/// * `kid` - KEY ID
/// * `n`   - RSA modulus
/// * `e`   - RSA exponent
#[derive(Deserialize)]
pub struct Jwk {
    pub kid: String,
    pub n: String,
    pub e: String,
}

/// Google JWKS의 전체 응답 구조이다.
/// 
/// # Fields
/// * `keys` - RSA 공개키 리스트
#[derive(Deserialize)]
pub struct JwkResponse {
    pub keys: Vec<Jwk>,
}