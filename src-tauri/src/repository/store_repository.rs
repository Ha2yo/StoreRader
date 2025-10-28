use crate::{config::env::get_env_value, entity::store_entity::StoreEntity};
use chrono::Utc;
use quick_xml::de::from_str;
use reqwest::{header::USER_AGENT, Client};
use serde::Deserialize;
use sqlx::PgPool;

// 한국소비자원 매장정보 API 응답 구조
#[derive(Debug, Deserialize)]
struct ApiResponse {
    #[serde(rename = "result")]
    result: ApiResult,
}

// <result> 내부 item 목록
#[derive(Debug, Deserialize)]
struct ApiResult {
    #[serde(rename = "iros.openapi.service.vo.entpInfoVO")]
    items: Vec<ApiItem>,
}

/// 실제 매장 단위 데이터 구조 (API XML → Rust 매핑)
#[derive(Debug, Deserialize)]
struct ApiItem {
    #[serde(rename = "entpId")]
    entp_id: String,
    #[serde(rename = "entpName")]
    entp_name: String,
    #[serde(rename = "entpTelno")]
    tel_no: Option<String>,
    #[serde(rename = "postNo")]
    post_no: Option<String>,
    #[serde(rename = "plmkAddrBasic")]
    plmk_addr: Option<String>,
    #[serde(rename = "roadAddrBasic")]
    road_addr: Option<String>,
    #[serde(rename = "xMapCoord")]
    x_coord: Option<f64>,
    #[serde(rename = "yMapCoord")]
    y_coord: Option<f64>,
}

// 매장 정보 API를 호출해 DB에 저장 (UPSERT)
pub async fn upsert_store(pool: &PgPool) -> Result<(), String> {
    let service_key = get_env_value("PUBLIC_API_KEY");

    // 요청 URL 생성
    let url = format!(
        "http://openapi.price.go.kr/openApiImpl/ProductPriceInfoService/getStoreInfoSvc.do?serviceKey={}&pageNo=1&numOfRows=10",
        service_key
    );

    // HTTP 요청
    let client = Client::new();
    let res = client
        .get(&url)
        .header(USER_AGENT, "StoreRader/1.0 (Rust reqwest)")
        .send()
        .await
        .map_err(|e| format!("API 요청 실패: {}", e))?;

    // 응답 본문 읽기
    let text = res
        .text()
        .await
        .map_err(|e| format!("본문 읽기 실패: {}", e))?;

    // XML → 구조체 변환
    let parsed: ApiResponse = from_str(&text).map_err(|e| format!("XML 파싱 실패: {}", e))?;

    let mut count = 0;

    for item in parsed.result.items {
        // 일부 항목은 주소가 없을 수 있음 → Skip
        if item.road_addr.is_none() && item.plmk_addr.is_none() {
            continue;
        }

        // API → Entity 변환
        let store = StoreEntity {
            id: 0, // SERIAL이므로 임시값
            store_id: item.entp_id.clone(),
            store_name: item.entp_name.clone(),
            tel_no: item.tel_no.clone(),
            post_no: item.post_no.clone(),
            plmk_addr: item.plmk_addr.clone().unwrap_or_default(),
            road_addr: item.road_addr.clone().unwrap_or_default(),
            x_coord: item.x_coord,
            y_coord: item.y_coord,
            created_at: Utc::now(),
            updated_at: Utc::now(),
        };

        // UPSERT (이미 존재하면 UPDATE)
    sqlx::query_as::<_, StoreEntity>(
    "INSERT INTO stores (
    store_id, store_name, tel_no, post_no, plmk_addr, road_addr, x_coord, y_coord
    )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        ON CONFLICT (store_id)
        DO UPDATE SET
            store_name = EXCLUDED.store_name,
            tel_no = EXCLUDED.tel_no,
            post_no = EXCLUDED.post_no,
            plmk_addr = EXCLUDED.plmk_addr,
            road_addr = EXCLUDED.road_addr,
            x_coord = EXCLUDED.x_coord,
            y_coord = EXCLUDED.y_coord,
            updated_at = NOW()",
    )
    .bind(&store.store_id)
    .bind(&store.store_name)
    .bind(&store.tel_no)
    .bind(&store.post_no)
    .bind(&store.plmk_addr)
    .bind(&store.road_addr)
    .bind(&store.x_coord)
    .bind(&store.y_coord)
    .fetch_optional(pool)
    .await
    .map_err(|e| format!("매장 데이터 업데이트 실패: {}", e))?;

        count += 1;
    }

    tracing::info!(" 총 {}개의 매장 데이터 DB에 추가 및 업데이트 완료", count);

    Ok(())
}
