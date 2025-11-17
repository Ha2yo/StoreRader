/************************************************************************
 * File: common/external/api_public_data.rs
 * Description:
 *     공공데이터포털 API 호출을 담당한다.
 *
 * Reponsibilities:
 *     1) fetch_goods_api()            
 *         - 상품 정보 조회
 * 
 *     2) fetch_store_api()            
 *         - 매장 정보 조회
 * 
 *     3) fetch_prices_api()           
 *         - 특정 날짜.매장 기준 가격 정보 조회
 * 
 *     4) fetch_region_codes_api()     
 *         - 지역 코드 정보 조회
************************************************************************/

use reqwest::{header::USER_AGENT, Client};

use crate::config::env::get_env_value;

/// 공공데이터포털에서 상품 정보를 조회한다.
///
/// # Returns
/// * `Ok(String)`  - API 응답 본문
/// * `Err(String)` - 요청 실패 또는 본문 파싱 실패
pub async fn fetch_goods_api(
) -> Result<String, String> {
    let service_key = get_env_value("PUBLIC_API_KEY");
    let url = format!(
        "http://openapi.price.go.kr/openApiImpl/ProductPriceInfoService/getProductInfoSvc.do?serviceKey={}",
        service_key
    );

    let client = Client::new();
    let res = client
        .get(&url)
        .header(USER_AGENT, "StoreRader/1.0")
        .send()
        .await
        .map_err(|e| format!("상품 API 요청 실패: {}", e))?;

    if !res.status().is_success() {
        return Err(format!("상품 API 오류 상태: {}", res.status()));
    }

    let response_body = res.text()
        .await
        .map_err(|e| format!("상품 본문 읽기 실패: {}", e))?;

    Ok(response_body)
}

/// 공공데이터포털에서 매장 정보를 조회한다.
///
/// # Returns
/// * `Ok(String)`  - API 응답 본문
/// * `Err(String)` - 요청 실패 혹은 본문 읽기 실패
pub async fn fetch_stores_api() -> Result<String, String> {
    let service_key = get_env_value("PUBLIC_API_KEY");
    let url = format!(
        "http://openapi.price.go.kr/openApiImpl/ProductPriceInfoService/getStoreInfoSvc.do?serviceKey={}",
        service_key
    );

    let client = Client::new();
    let res = client
        .get(&url)
        .header(USER_AGENT, "StoreRader/1.0")
        .send()
        .await
        .map_err(|e| format!("매장 API 요청 실패: {}", e))?;

    if !res.status().is_success() {
        return Err(format!("매장 API 오류 상태: {}", res.status()));
    }

    let response_body = res.text()
        .await
        .map_err(|e| format!("매장 본문 읽기 실패: {}", e))?;

    Ok(response_body)
}

/// 특정 날짜와 매장을 기준으로 가격 정보를 조회한다.
///
/// # Arguments
/// * `inspect_day` - 조회 기준 날짜 (YYYYMMDD)
/// * `store_id` - 매장 ID
///
/// # Returns
/// * `Ok(String)`  - API 응답 본문
/// * `Err(String)` - 요청 실패 혹은 본문 읽기 실패
pub async fn fetch_prices_api(
    inspect_day: &str, 
    store_id: &str
) -> Result<String, String> {
    let service_key = get_env_value("PUBLIC_API_KEY");
    let url = format!(
        "http://openapi.price.go.kr/openApiImpl/ProductPriceInfoService/getProductPriceInfoSvc.do?goodInspectDay={}&entpId={}&ServiceKey={}",
        inspect_day, store_id, service_key
    );

    let client = Client::new();
    let res = client
        .get(&url)
        .header(USER_AGENT, "StoreRader/1.0")
        .send()
        .await
        .map_err(|e| format!("가격 API 요청 실패: {}", e))?;

    if !res.status().is_success() {
        return Err(format!("가격 API 오류 상태: {}", res.status()));
    }

    let response_body = res.text()
        .await
        .map_err(|e| format!("가격 본문 읽기 실패: {}", e))?;

    Ok(response_body)
}

/// 공공데이터포털에서 지역 코드 정보를 조회한다.
///
/// # Returns
/// * `Ok(String)`  - API 응답 본문
/// * `Err(String)` - 요청 실패 혹은 본문 읽기 실패
pub async fn fetch_region_codes_api() -> Result<String, String> {
    let service_key = get_env_value("PUBLIC_API_KEY");
    let url = format!(
        "http://openapi.price.go.kr/openApiImpl/ProductPriceInfoService/getStandardInfoSvc.do?classCode=AR&ServiceKey={}",
        service_key
    );

    let client = Client::new();
    let res = client
        .get(&url)
        .header(USER_AGENT, "StoreRader/1.0")
        .send()
        .await
        .map_err(|e| format!("지역코드 API 요청 실패: {}", e))?;

    if !res.status().is_success() {
        return Err(format!("지역코드 API 오류 상태: {}", res.status()));
    }

    let respond_body = res.text()
        .await
        .map_err(|e| format!("지역코드 본문 읽기 실패: {}", e))?;

    Ok(respond_body)
}
