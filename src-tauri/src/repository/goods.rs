use reqwest::{header::USER_AGENT, Client};
use quick_xml::de::from_str;
use serde::Deserialize;
use sqlx::PgPool;
use crate::config::env::get_env_value;

// 한국소비자원 상품정보 API 구조체
#[derive(Debug, Deserialize)]
struct ApiResponse {
    #[serde(rename = "result")]
    result: ApiResult
}

// <result> 내부 item 목록
#[derive(Debug, Deserialize)]
struct ApiResult {
    #[serde(rename = "item")]
    items: Vec<ApiItem>,
}

// 실제 상품 단위 데이터 구조
#[derive(Debug, Deserialize)]
struct ApiItem {
    #[serde(rename = "goodId")]
    good_id: String,
    #[serde(rename = "goodName")]
    good_name: String,
    #[serde(rename = "goodTotalCnt")]
    good_total_cnt: Option<String>,
    #[serde(rename = "goodTotalDivCode")]
    good_total_div_code: Option<String>,
}

// DB 저장용 구조체
struct Goods {
    good_id: String,
    good_name: String,
    total_cnt: Option<i32>,
    total_div_code: Option<String>,
}

// API 데이터 받아서 DB에 저장
pub async fn fetch_and_save_goods(pool: &PgPool) -> Result<(), String> {
    let service_key = get_env_value("PUBLIC_API_KEY");
    // 요청 URL 생성
    let url = format!(
        "http://openapi.price.go.kr/openApiImpl/ProductPriceInfoService/getProductInfoSvc.do?serviceKey={}&pageNo=1&numOfRows=10",
        service_key
    );

    // HTTP 클라이언트 생성 및 요청
    let client = Client::new();
    let res = client
        .get(&url)
        .header(USER_AGENT, "StoreRader/1.0 (Rust reqwest)")
        .send()
        .await
        .map_err(|e| format!("API 요청 실패: {}", e))?;

    // 본문 추출
    let text = res.text().await.map_err(|e| format!("본문 읽기 실패: {}", e))?;
    let parsed: ApiResponse = from_str(&text).map_err(|e| format!("XML 파싱 실패: {}", e))?;
    
    let mut count = 0;

    for item in parsed.result.items {
        let good = Goods {
            good_id: item.good_id.clone(),
            good_name: item.good_name.clone(),
            total_cnt: item.good_total_cnt.as_ref().and_then(|s| s.parse::<i32>().ok()),
            total_div_code: item.good_total_div_code.clone(),
        };

        // DB에 삽입 (이미 있으면 업데이트)
        sqlx::query!(
            r#"
            INSERT INTO goods (good_id, good_name, total_cnt, total_div_code)
            VALUES ($1, $2, $3, $4)
            ON CONFLICT (good_id)
            DO UPDATE SET
                good_name = EXCLUDED.good_name,
                total_cnt = EXCLUDED.total_cnt,
                total_div_code = EXCLUDED.total_div_code,
                updated_at = NOW()
            "#,
            good.good_id,
            good.good_name,
            good.total_cnt,
            good.total_div_code
        )
        .execute(pool)
        .await
        .map_err(|e| format!("DB 저장 실패 ({}): {}", good.good_name, e))?;

        count += 1;
    }
    tracing::info!("{}개의 상품 데이터 DB에 추가 및 업데이트 완료", count);

    Ok(())
}
