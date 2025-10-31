use reqwest::Client;
use serde_json::Value;
use std::env;

/// vWorld API를 이용해 주소 → (위도, 경도) 변환
pub async fn geocode_with_vworld(addr: &str) -> Result<Option<(f64, f64)>, String> {
    // 환경 변수에서 API 키 불러오기
    let api_key = env::var("VWORLD_API_KEY")
        .map_err(|_| "VWORLD_API_KEY 환경 변수를 찾을 수 없습니다.".to_string())?;

    // 요청 URL 구성
    let url = format!(
        "https://api.vworld.kr/req/address?service=address&request=getCoord&version=2.0&crs=epsg:4326&address={}&refine=true&simple=false&type=road&key={}",
        urlencoding::encode(addr),
        api_key
    );

    // HTTP 요청
    let client = Client::new();
    let res = client
        .get(&url)
        .send()
        .await
        .map_err(|e| format!("vWorld 요청 실패: {}", e))?;

    // 본문 추출
    let text = res
        .text()
        .await
        .map_err(|e| format!("본문 읽기 실패: {}", e))?;

    // JSON 파싱
    let json: Value = serde_json::from_str(&text)
        .map_err(|e| format!("JSON 파싱 실패: {}", e))?;

    // 좌표 추출
    if let Some(status) = json["response"]["status"].as_str() {
        if status == "OK" {
            if let Some(point) = json["response"]["result"]["point"].as_object() {
                let x = point["x"].as_str().unwrap_or("0").parse::<f64>().unwrap_or(0.0);
                let y = point["y"].as_str().unwrap_or("0").parse::<f64>().unwrap_or(0.0);
                return Ok(Some((y, x))); // (위도, 경도)
            }
        }
    }

    Ok(None)
}
