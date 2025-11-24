/************************************************************************
 * File: main_axum.rs
 * Description:
 *     StoreRader 서버의 엔트리 포인트. 환경 변수 로드, 로깅 초기화, DB 연결,
 *     CORS 설정, 라우터 통합 및 서버 실행까지 전체 서버의 실행 흐름을 담당한다.
 *
 * Reponsibilities:
 *     1) init_env()
 *         - 환경 변수 (.env) 로드
 *
 *     2) tracing_subscriber
 *         - 로그 레벨 및 출력 포맷 설정
 *
 *     3) connect_db()
 *         - PostgreSQL 커넥션 풀 생성
 *
 *     4) CORS 설정
 *         - 프론트엔드 (Tarui/React) 접근 허용
 *
 *     5) 라우터 구성
 *         - /auth/...         : 인증
 *         - /sync/...         : 공공데이터 기반 DB 동기화
 *         - /get/...          : 데이터 조회
 *         - /update/...       : 데이터 갱신
 *
 *     6) 서버 실행 (0.0.0.0:3000 리스닝)
************************************************************************/

use axum::{
    routing::{get, post},
    Router,
};
use reqwest::Method;
use tower_http::cors::{Any, CorsLayer};
use tracing_subscriber::{layer::SubscriberExt, util::SubscriberInitExt};

use storerader_lib::{
    config::{database::connect_db, env::init_env},
    domain::{
        auth::handler::auth_google_handler,
        good::handler::goods_list_handler,
        price::handler::prices_get_handler,
        price_change::handler::{price_change_get_handler, sync_price_change_handler},
        region_code::handler::region_codes_list_handler,
        store::handler::stores_list_handler,
        sync::handler::{
            sync_goods_and_stores_handler, sync_prices_handler, sync_region_codes_handler,
        },
        user_log::handler::{user_selection_log_get_handler, user_selection_log_update_handler},
        user_preference::handler::user_preference_get_handler,
    },
};

#[tokio::main]
async fn main() {
    init_env();

    tracing_subscriber::registry()
        .with(tracing_subscriber::EnvFilter::new(
            std::env::var("RUST_LOG").unwrap_or_else(|_| "info".into()),
        ))
        .with(tracing_subscriber::fmt::layer())
        .init();

    let pool = connect_db().await;

    let cors = CorsLayer::new()
        .allow_origin(Any)
        .allow_methods([Method::GET, Method::POST, Method::OPTIONS])
        .allow_headers(Any);

    let auth_routes = Router::new().route("/auth/google", post(auth_google_handler));

    let sync_routes = Router::new()
        .route("/sync/goods-and-stores", get(sync_goods_and_stores_handler))
        .route("/sync/region-codes", get(sync_region_codes_handler))
        .route("/sync/prices", get(sync_prices_handler))
        .route("/sync/price-change", get(sync_price_change_handler));

    let get_routes = Router::new()
        .route("/get/stores/all", get(stores_list_handler))
        .route("/get/goods/all", get(goods_list_handler))
        .route("/get/region-codes/all", get(region_codes_list_handler))
        .route("/get/prices", get(prices_get_handler))
        .route("/get/user-preferences", post(user_preference_get_handler))
        .route("/get/user-selection-log",get(user_selection_log_get_handler),)
        .route("/get/price-change", get(price_change_get_handler))
        .route("/get/preference-threshold", get("d"));

    let update_routes = Router::new()
        .route("/update/user-selection-log",post(user_selection_log_update_handler));

    let app = Router::new()
        .route("/", get(|| async { "OK" }))
        .merge(sync_routes)
        .merge(auth_routes)
        .merge(get_routes)
        .merge(update_routes)
        .layer(cors)
        .with_state(pool.clone());

    tracing::info!("서버가 http://localhost:3000에서 시작되었습니다");
    let listener = tokio::net::TcpListener::bind("0.0.0.0:3000").await.unwrap();
    axum::serve(listener, app).await.unwrap();
}
