use crate::domain::{log::dto::dto_res::UserSelectionLogRes, price::dto::dto_res::PriceRes, price_change::dto::dto_res::PriceTrendRes};
use sqlx::PgPool;

pub async fn find_latest_prices_by_good_name(
    pool: &PgPool,
    good_name: &str,
) -> Result<Vec<PriceRes>, String> {
    let result = sqlx::query_as::<_, PriceRes>(
        "
        SELECT p.store_id, p.price, p.inspect_day
        FROM prices p
        JOIN (
            SELECT store_id, MAX(inspect_day) AS latest_day
            FROM prices
            WHERE good_id = (
                SELECT good_id FROM goods WHERE good_name = $1 LIMIT 1
            )
            GROUP BY store_id
        ) latest
        ON p.store_id = latest.store_id AND p.inspect_day = latest.latest_day
        WHERE p.good_id = (
            SELECT good_id FROM goods WHERE good_name = $1 LIMIT 1
        )
        ",
    )
    .bind(good_name)
    .fetch_all(pool)
    .await
    .map_err(|e| format!("가격 데이터 조회 실패: {}", e))?;

    Ok(result)
}



pub async fn fetch_user_selection_logs(
    pool: &PgPool,
    user_id: i32,
) -> Result<Vec<UserSelectionLogRes>, String> {
    let result = sqlx::query_as::<_, UserSelectionLogRes>(
        "
        SELECT 
            l.id,
            l.store_id,
            s.store_name,
            l.good_id,
            g.good_name,
            l.price,
            p.price AS current_price,
            s.x_coord,
            s.y_coord,
            l.created_at
        FROM user_selection_log l
        JOIN stores s ON s.store_id = l.store_id
        JOIN goods g ON g.good_id = l.good_id
        JOIN LATERAL (
            SELECT price
            FROM prices 
            WHERE store_id = l.store_id AND good_id = l.good_id
            ORDER BY inspect_day DESC
            LIMIT 1
        ) p ON TRUE
        WHERE l.user_id = $1
        ORDER BY l.created_at DESC;
        ",
    )
    .bind(user_id)
    .fetch_all(pool)
    .await
    .map_err(|e| format!("로그 조회 실패: {}", e))?;

    Ok(result)
}


pub async fn fetch_price_drop_top(
    pool: &PgPool,
) -> Result<Vec<PriceTrendRes>, String> {

    sqlx::query_as::<_, PriceTrendRes>("
    WITH latest_day AS (
            SELECT MAX(inspect_day) AS day
            FROM price_change
        )
        SELECT
            pc.good_id,
            g.good_name,
            CAST(AVG(pc.diff) AS INT) AS avg_drop,
            MIN(pc.diff) AS min_drop,
            MAX(pc.diff) AS max_drop,
            COUNT(*) AS change_count,
            pc.inspect_day
        FROM price_change pc
        JOIN latest_day ld ON pc.inspect_day = ld.day
        JOIN goods g ON pc.good_id = g.good_id
        WHERE pc.diff < 0
        GROUP BY pc.good_id, g.good_name, pc.inspect_day
        ORDER BY avg_drop ASC
        LIMIT 50;")
        .fetch_all(pool)
        .await
        .map_err(|e| format!("가격 변동 정보 (하락) 조회 실패: {}", e))
}

pub async fn fetch_price_rise_top(
    pool: &PgPool,
) -> Result<Vec<PriceTrendRes>, String> {
sqlx::query_as::<_, PriceTrendRes>("
WITH latest_day AS (
            SELECT MAX(inspect_day) AS day
            FROM price_change
        )
        SELECT
            pc.good_id,
            g.good_name,
            CAST(AVG(pc.diff) AS INT) AS avg_drop,
            MIN(pc.diff) AS min_drop,
            MAX(pc.diff) AS max_drop,
            COUNT(*) AS change_count,
            pc.inspect_day
        FROM price_change pc
        JOIN latest_day ld ON pc.inspect_day = ld.day
        JOIN goods g ON pc.good_id = g.good_id
        WHERE pc.diff > 0
        GROUP BY pc.good_id, g.good_name, pc.inspect_day
        ORDER BY avg_drop DESC
        LIMIT 50;")
        .fetch_all(pool)
        .await
        .map_err(|e| format!("가격 변동 정보 (상승) 조회 실패: {}", e))
}
