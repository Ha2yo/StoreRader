use reqwest::{header::USER_AGENT, Client};

use crate::config::env::get_env_value;


// 상품정보 API 요청
pub async fn fetch_goods_api() -> Result<String, String> {
    let service_key = get_env_value("PUBLIC_API_KEY");
    let url = format!(
        "http://openapi.price.go.kr/openApiImpl/ProductPriceInfoService/getProductInfoSvc.do?serviceKey={}",
        service_key
    );

    let client = Client::new();
    let res = client
        .get(&url)
        .header(USER_AGENT, "StoreRader/1.0 (Rust reqwest)")
        .send()
        .await
        .map_err(|e| format!("상품 API 요청 실패: {}", e))?;

    if !res.status().is_success() {
        return Err(format!("상품 API 오류 상태: {}", res.status()));
    }

    res.text().await.map_err(|e| format!("상품 본문 읽기 실패: {}", e))
}

// 매장정보 API 요청
pub async fn fetch_store_api() -> Result<String, String> {
    let service_key = get_env_value("PUBLIC_API_KEY");
    let url = format!(
        "http://openapi.price.go.kr/openApiImpl/ProductPriceInfoService/getStoreInfoSvc.do?serviceKey={}",
        service_key
    );

    let client = Client::new();
    let res = client
        .get(&url)
        .header(USER_AGENT, "StoreRader/1.0 (Rust reqwest)")
        .send()
        .await
        .map_err(|e| format!("매장 API 요청 실패: {}", e))?;

    if !res.status().is_success() {
        return Err(format!("매장 API 오류 상태: {}", res.status()));
    }

    res.text().await.map_err(|e| format!("매장 본문 읽기 실패: {}", e))
}

pub async fn fetch_prices_api(inspect_day: &str, store_id: &str) -> Result<String, String> {
    let service_key = get_env_value("PUBLIC_API_KEY");
    let url = format!(
        "http://openapi.price.go.kr/openApiImpl/ProductPriceInfoService/getProductPriceInfoSvc.do?goodInspectDay={}&entpId={}&ServiceKey={}",
        inspect_day, store_id, service_key
    );

    let client = Client::new();
    let res = client
        .get(&url)
        .header(USER_AGENT, "StoreRader/1.0 (Rust reqwest)")
        .send()
        .await
        .map_err(|e| format!("가격 API 요청 실패: {}", e))?;

    if !res.status().is_success() {
        return Err(format!("가격 API 오류 상태: {}", res.status()));
    }

    res.text().await.map_err(|e| format!("가격 본문 읽기 실패: {}", e))
}

pub async fn fetch_region_codes_api() -> Result<String, String> {
    let service_key = get_env_value("PUBLIC_API_KEY");
    let url = format!(
        "http://openapi.price.go.kr/openApiImpl/ProductPriceInfoService/getStandardInfoSvc.do?classCode=AR&ServiceKey={}",
        service_key
    );

    let client = Client::new();
    let res = client
        .get(&url)
        .header(USER_AGENT, "StoreRader/1.0 (Rust reqwest)")
        .send()
        .await
        .map_err(|e| format!("지역코드 API 요청 실패: {}", e))?;

    if !res.status().is_success() {
        return Err(format!("지역코드 API 오류 상태: {}", res.status()));
    }

    res.text().await.map_err(|e| format!("지역코드 본문 읽기 실패: {}", e))
}