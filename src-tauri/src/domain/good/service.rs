use axum::Json;
use sqlx::PgPool;

use crate::{common::repository::repository_good, domain::good::dto::dto_res::GoodRes};

pub async fn get_all_goods(pool: &PgPool) -> Result<Json<Vec<GoodRes>>, String> {
    let goods = repository_good::get_all_goods(pool)
        .await
        .map_err(|e| format!("DB 조회 실패: {}", e))?;

    let result = goods
        .into_iter()
        .map(|g| GoodRes {
            id: g.id,
            good_id: g.good_id,
            good_name: g.good_name,
            total_cnt: g.total_cnt,
            total_div_code: g.total_div_code,
            created_at: g.created_at,
            updated_at: g.created_at,
        })
        .collect::<Vec<GoodRes>>();

    Ok(Json(result))
}
