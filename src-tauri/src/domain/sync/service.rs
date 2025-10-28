use chrono::Utc;
use reqwest::{header::USER_AGENT, Client};
use quick_xml::de::from_str;
use sqlx::PgPool;

use crate::config::env::get_env_value;
use crate::domain::sync::dto::goods_api_dto::ApiResponse as GoodsApiResponse;
use crate::domain::sync::dto::stores_api_dto::ApiResponse as StoreApiResponse;
use crate::domain::sync::entity::good_entity::GoodEntity;
use crate::domain::sync::entity::store_entity::StoreEntity;
use crate::domain::sync::repository::{upsert_good_to_db, upsert_store_to_db};

pub async fn upsert_api_data(pool: &PgPool) {
    if let Err(e) = upsert_good(pool).await {
        tracing::error!("상품 데이터 동기화 실패: {}", e);
    }
    if let Err(e) = upsert_store(pool).await {
        tracing::error!("상품 데이터 동기화 실패: {}", e);
    }
}

// API 상품 데이터 받아서 DB에 저장
pub async fn upsert_good(pool: &PgPool) -> Result<(), String> {
    let service_key = get_env_value("PUBLIC_API_KEY");
    // 요청 URL 생성
    let url = format!(
        "http://openapi.price.go.kr/openApiImpl/ProductPriceInfoService/getProductInfoSvc.do?serviceKey={}&pageNo=1&numOfRows=10",
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

    // 본문 추출
    let text = res.text().await.map_err(|e| format!("본문 읽기 실패: {}", e))?;
    
    // XML → 구조체 변환
    let parsed: GoodsApiResponse = from_str(&text).map_err(|e| format!("XML 파싱 실패: {}", e))?;
    
    let mut count = 0;

    for item in parsed.result.items {
        let good = GoodEntity {
        id: 0, // SERIAL이므로 임시값
        good_id: item.good_id.clone(),
        good_name: item.good_name.clone(),
        total_cnt: item.good_total_cnt.as_ref().and_then(|s| s.parse::<i32>().ok()),
        total_div_code: item.good_total_div_code.clone(),
        created_at: Utc::now(),
        updated_at: Utc::now(),
    };

    upsert_good_to_db(pool, &good).await?;
    count += 1;
    }
    tracing::info!("총 {}개의 상품 데이터 업데이트 완료", count);

    Ok(())
}

// API 매장 데이터 받아서 DB에 저장
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

    // 본문 추출
    let text = res.text().await.map_err(|e| format!("본문 읽기 실패: {}", e))?;

    // XML → 구조체 변환
    let parsed: StoreApiResponse = from_str(&text).map_err(|e| format!("XML 파싱 실패: {}", e))?;

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

        upsert_store_to_db(pool, &store).await?;
        count += 1;
    }

    tracing::info!(" 총 {}개의 매장 데이터 업데이트 완료", count);

    Ok(())
}
