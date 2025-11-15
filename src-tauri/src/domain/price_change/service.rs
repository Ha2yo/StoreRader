use sqlx::PgPool;

use crate::{
    common::repository::repository_join::{fetch_price_drop_top, fetch_price_rise_top},
    domain::price_change::dto::dto_res::PriceTrendRes,
};

pub async fn get_price_change(
    pool: &PgPool,
    status: &String,
) -> Result<Vec<PriceTrendRes>, String> {
     match status.as_str() {
        "down" => fetch_price_drop_top(pool).await,
        "up"   => fetch_price_rise_top(pool).await,
         _ => fetch_price_drop_top(pool).await,
    }
}
