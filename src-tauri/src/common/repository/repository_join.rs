use crate::domain::{log::dto::dto_res::UserSelectionLogRes, price::dto::dto_res::PriceRes};
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
