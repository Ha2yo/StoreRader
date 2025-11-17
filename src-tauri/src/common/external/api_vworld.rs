/************************************************************************
 * File: common/external/api_vworld.rs
 * Description:
 *     vWorld API를 이용해 주소 문자열을 위도.경도로 변환한다.
 *
 * Reponsibilities:
 *     1) geocode_with_vworld()
 *         - vWorld 주소 검색 API 호출
 *         - 위도.경도 값 반환
************************************************************************/

use reqwest::{Client, header::USER_AGENT};
use serde_json::Value;
use std::env;

/// vWorld API를 이용해 주소 문자열을 위도.경도로 변환한다.
/// 
/// # Arguments
/// * `addr` - 좌표를 구할 도로명 주소 또는 지번 주소
/// 
/// # Returns
/// * `Ok(Some((lat, lon)))`    - 변환 성공
/// * `OK(None)`                - 결과 없음
/// * `Err(String)`             - 요청 또는 파싱 오류
pub async fn geocode_with_vworld(
    addr: &str
) -> Result<Option<(f64, f64)>, String> {
    let api_key = env::var("VWORLD_API_KEY")
        .map_err(|_| "VWORLD_API_KEY 환경 변수를 찾을 수 없습니다.".to_string())?;

    let url = format!(
        "https://api.vworld.kr/req/address?service=address&request=getCoord&version=2.0&crs=epsg:4326&address={}&refine=true&simple=false&type=road&key={}",
        urlencoding::encode(addr),
        api_key
    );

    let client = Client::new();
    let res = client
        .get(&url)
        .header(USER_AGENT, "StoreRader/1.0")
        .send()
        .await
        .map_err(|e| format!("vWorld 요청 실패: {}", e))?;

    let text = res
        .text()
        .await
        .map_err(|e| format!("본문 읽기 실패: {}", e))?;

    let json: Value = serde_json::from_str(&text).map_err(|e| format!("JSON 파싱 실패: {}", e))?;

    if let Some(status) = json["response"]["status"].as_str() {
        if status == "OK" {
            if let Some(point) = json["response"]["result"]["point"].as_object() {
                let x = point["x"]
                    .as_str()
                    .unwrap_or("0")
                    .parse::<f64>()
                    .unwrap_or(0.0);
                let y = point["y"]
                    .as_str()
                    .unwrap_or("0")
                    .parse::<f64>()
                    .unwrap_or(0.0);
                // vWorld 응답 구조는 x=경도, y=위도라서 순서를 바꿔 반환한다.
                return Ok(Some((y, x)));
            }
        }
    }

    Ok(None)
}
