use chrono::Utc;
use quick_xml::de::from_str;
use sqlx::PgPool;
use std::io::{self, Write};

use crate::{
    common::{
        entity::{entity_good::GoodEntity, entity_store::StoreEntity},
        external::{
            api_public_data::{fetch_goods_api, fetch_store_api},
            api_vworld::geocode_with_vworld,
        },
        repository::{repository_good::upsert_good_to_db, repository_store::upsert_store_to_db},
    },
    domain::sync::dto::{
        goods_api_dto::ApiResponse as goodApiResponse,
        stores_api_dto::ApiResponse as storeApiResponse,
    },
};

pub async fn upsert_api_data(pool: &PgPool) {
    if let Err(e) = upsert_good(pool).await {
        tracing::error!("상품 데이터 동기화 실패: {}", e);
    }
    if let Err(e) = upsert_store(pool).await {
        tracing::error!("매장 데이터 동기화 실패: {}", e);
    }
}

// API 상품 데이터 받아서 DB에 저장
pub async fn upsert_good(pool: &PgPool) -> Result<(), String> {
    // 본문 추출
    let text = fetch_goods_api().await?;

    // XML → 구조체 변환
    let parsed: goodApiResponse = from_str(&text).map_err(|e| format!("XML 파싱 실패: {}", e))?;

    let mut count: i32 = 0;

    for item in parsed.result.items {
        let good = GoodEntity {
            id: 0, // SERIAL이므로 임시값
            good_id: item.good_id.clone(),
            good_name: item.good_name.clone(),
            total_cnt: item
                .good_total_cnt
                .as_ref()
                .and_then(|s| s.parse::<i32>().ok()),
            total_div_code: item.good_total_div_code.clone(),
            created_at: Utc::now().naive_utc(),
            updated_at: Utc::now().naive_utc(),
        };

        upsert_good_to_db(pool, &good).await?;
        count += 1;
    }
    tracing::info!("상품 데이터 {}개 업데이트 완료", count);

    Ok(())
}

// API 매장 데이터 받아서 DB에 저장
pub async fn upsert_store(pool: &PgPool) -> Result<(), String> {
    let text = fetch_store_api().await?;
    let parsed: storeApiResponse = from_str(&text).map_err(|e| format!("XML 파싱 실패: {}", e))?;

    let mut count = 0;
    let mut success_count = 0;
    let mut fail_count = 0;
    for item in parsed.result.items {
        // 주소가 완전히 없는 경우는 스킵
        if item.road_addr.is_none() && item.jibun_addr.is_none() {
            continue;
        }

        // 기본 주소로 사용할 필드 선택 (도로명 우선)
        let addr = item
            .road_addr
            .clone()
            .unwrap_or_else(|| item.jibun_addr.clone().unwrap_or_default());

        let coords = geocode_with_vworld(&addr).await?;

        match coords {
            Some((lat, lon)) => {
                success_count += 1;
                let store = StoreEntity {
                    id: 0,
                    store_id: item.entp_id.clone(),
                    store_name: item.entp_name.clone(),
                    tel_no: item.tel_no.clone(),
                    post_no: item.post_no.clone(),
                    jibun_addr: item.jibun_addr.clone().unwrap_or_default(),
                    road_addr: item.road_addr.clone().unwrap_or_default(),
                    x_coord: Some(lat),
                    y_coord: Some(lon),
                    created_at: Utc::now().naive_utc(),
                    updated_at: Utc::now().naive_utc(),
                };
                upsert_store_to_db(pool, &store).await?;
            }
            None => {
                fail_count += 1;
            }
        }
        print!("\r매장 좌표 지오코딩 중... 성공: {}개 | 실패: {}개", success_count, fail_count);
        io::stdout().flush().unwrap();
        count += 1;
    }
    println!();
    tracing::info!("매장 데이터 {}개 중 {}개 업데이트 완료", count, success_count);
    Ok(())
}
