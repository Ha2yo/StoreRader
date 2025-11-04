use chrono::Utc;
use quick_xml::de::from_str;
use sqlx::PgPool;
use std::io::{self, Write};

use crate::{
    common::{
        entity::{entity_good::GoodEntity, entity_price::PriceEntity, entity_region::RegionEntity, entity_store::StoreEntity},
        external::{
            api_public_data::{fetch_goods_api, fetch_prices_api, fetch_region_codes_api, fetch_store_api},
            api_vworld::geocode_with_vworld,
        },
        repository::{
            repository_good::upsert_good_to_db, repository_price::upsert_price_to_db, repository_region::upsert_region_to_db, repository_store::{get_all_stores_id, upsert_store_to_db}
        },
    },
    domain::sync::dto::{
        dto_goods_api::ApiResponse as goodApiResponse, dto_prices_api::ApiResponse as priceApiResponse, dto_region_codes_api::ApiResponse as regionCodesApiResponse, dto_stores_api::ApiResponse as storeApiResponse
    },
};

pub async fn upsert_api_data(pool: &PgPool) -> Result<(), String> {
    if let Err(e) = upsert_good(pool).await {
        tracing::error!("상품 데이터 동기화 실패: {}", e);
        return Err(format!("상품 데이터 동기화 실패: {}", e));
    }
    if let Err(e) = upsert_store(pool).await {
        tracing::error!("매장 데이터 동기화 실패: {}", e);
        return Err(format!("매장 데이터 동기화 실패: {}", e));
    }
    Ok(())
}

// API 상품 데이터 받아서 DB에 저장
pub async fn upsert_good(pool: &PgPool) -> Result<(), String> {
    // 본문 추출
    let text = fetch_goods_api().await?;

    // XML → 구조체 변환
    let parsed: goodApiResponse = from_str(&text).map_err(|e| format!("XML 파싱 실패: {}", e))?;

    let mut total_count: i32 = 0;

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
        total_count += 1;
    }
    tracing::info!("상품 데이터 {}개 업데이트 완료", total_count);

    Ok(())
}

// API 매장 데이터 받아서 DB에 저장
pub async fn upsert_store(pool: &PgPool) -> Result<(), String> {
    let text = fetch_store_api().await?;
    let parsed: storeApiResponse = from_str(&text).map_err(|e| format!("XML 파싱 실패: {}", e))?;

    let mut total_count = 0;
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
        print!(
            "\r매장 좌표 지오코딩 중... 성공: {}개 | 실패: {}개",
            success_count, fail_count
        );
        io::stdout().flush().unwrap();
        total_count += 1;
    }
    println!();
    tracing::info!(
        "매장 데이터 {}개 중 {}개 업데이트 완료",
        total_count,
        success_count
    );
    Ok(())
}

pub async fn upsert_price(pool: &PgPool, inspect_day: &str) -> Result<(), String> {
    // DB에서 매장 ID 목록 가져오기
    let store_ids = get_all_stores_id(pool).await?;

    let mut total_count = 0;
    let mut success_count = 0;

    // 각 매장 ID에 대해 순회
    for store_id in store_ids {
        // API 호출
        let text = fetch_prices_api(inspect_day, &store_id).await?;

        // 데이터가 없는 매장은 스킵
        if !text.contains("goodPriceVO") {
            tracing::warn!("조사 데이터 없음 — store_id {}", store_id);
            continue;
        }

        let parsed: priceApiResponse =
            from_str(&text).map_err(|e| format!("XML 파싱 실패 (store_id {}): {}", store_id, e))?;

        // 응답 데이터 순회
        for item in parsed.result.items {
            // 가격이 비어 있으면 스킵
            if item.good_price.trim().is_empty() {
                continue;
            }

            // PriceEntity 생성
            let price = PriceEntity {
                id: 0, // SERIAL이라 임시
                good_id: item.good_id.clone(),
                store_id: item.entp_id.clone(),
                inspect_day: item.good_inspect_day.clone(),
                price: item.good_price.parse::<i32>().unwrap_or(0),
                is_one_plus_one: item.plus_one_yn.unwrap_or_else(|| "N".to_string()),
                is_discount: item.good_dc_yn.unwrap_or_else(|| "N".to_string()),
                discount_start: item.good_dc_start_day.clone(),
                discount_end: item.good_dc_end_day.clone(),
                created_at: Utc::now().naive_utc(),
            };

            // DB 저장 (repository 호출)
            upsert_price_to_db(pool, &price).await?;

            total_count += 1;
        }
        success_count += 1;

        print!("\r가격 데이터 갱신 중... 성공: {}개", success_count);
        io::stdout().flush().unwrap();
    }

    // 로그 출력
    tracing::info!("가격 데이터 {}개 업데이트 완료", total_count);

    Ok(())
}

pub async fn upsert_region_codes(pool: &PgPool) -> Result<(), String> {
    // 본문 추출
    let text = fetch_region_codes_api().await?;

    // XML → 구조체 변환
    let parsed: regionCodesApiResponse = from_str(&text).map_err(|e| format!("XML 파싱 실패: {}", e))?;

    let mut total_count: i32 = 0;

    for item in parsed.result.items {
        let level:i16 = if item.high_code == "020000000"{
            1
        } else {
            2
        };
        let region = RegionEntity {
            code: item.code.clone(),
            name: item.code_name.clone(),
            parent_code: item.high_code.clone(),
            level,
        };

        upsert_region_to_db(pool, &region).await?;
        total_count += 1;
    }
    tracing::info!("지역코드 데이터 {}개 업데이트 완료", total_count);

    Ok(())
}
