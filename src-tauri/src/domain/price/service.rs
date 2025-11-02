use sqlx::PgPool;

use crate::{common::repository::repository_join::find_latest_prices_by_good_name, domain::price::dto::dto_res::PriceRes};

pub async fn get_latest_prices(
    pool: &PgPool,
    good_name: &str,
) -> Result<Vec<PriceRes>, String> {
    find_latest_prices_by_good_name(pool, good_name).await
}
