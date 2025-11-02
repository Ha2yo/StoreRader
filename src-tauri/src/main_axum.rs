/***********************************************************
 main_axum.rs는 StoreRader 서버의 진입점으로,
 서버 초기화 및 주요 라우팅 설정을 담당한다

 1. init_env()
    - 실행 환경에 따라 .env 파일을 로드
    - Android / Desktop 환경 모두 대응

 2. tracing_subscriber::registry()
    - 로그 레벨 지정
    - 로그 포맷팅 및 레이어 지정

 3. connect_db()
    - PostgreSQL 연결 풀 생성

 4. CORS (Cross-Origin Resouce Sharing) 설정
    - 다른 도메인에서의 접속 허용

 5. 라우터 구성
    - "/" -> 단순 헬스체크용 엔드포인트 (GET)
    - "/auth/google" -> Google OAuth 로그인 요청 처리 (POST)

 6. 서버 실행
    - 0.0.0.0:3000에서 TCP 리스너 바인딩
    - HTTP 서버 시작
***********************************************************/

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
        auth::handler::auth_google_handler, good::handler::get_all_goods_handler, store::handler::{get_all_stores_handler, get_stores_by_good_id}, sync::{handler::{upsert_api_data_handler, upsert_prices_handler}}
    },
};

#[tokio::main]
async fn main() {
    init_env();
    // 로그 세팅
    tracing_subscriber::registry()
        .with(tracing_subscriber::EnvFilter::new(
            std::env::var("RUST_LOG").unwrap_or_else(|_| "info".into()),
        ))
        .with(tracing_subscriber::fmt::layer())
        .init();

    // 데이터베이스 풀 생성
    let pool = connect_db().await;

    // CORS 설정
    let cors = CorsLayer::new()
        .allow_origin(Any)
        .allow_methods([Method::GET, Method::POST, Method::OPTIONS])
        .allow_headers(Any);
    
    // 라우터 구성
    let app = Router::new()
        .route("/", get(|| async { "OK" }))
        .route("/sync/goodsAndStores", get(upsert_api_data_handler))
        .route("/sync/Prices", get(upsert_prices_handler))
        .route("/auth/google", post(auth_google_handler))
        .route("/getStoreInfo/all", get(get_all_stores_handler))
        .route("/getStoreInfo", get(get_stores_by_good_id))
        .route("/getGoodInfo/all", get(get_all_goods_handler))
        .layer(cors)
        .with_state(pool.clone());

    // 서버 실행
    tracing::info!("서버가 http://localhost:3000에서 시작되었습니다");
    let listener = tokio::net::TcpListener::bind("0.0.0.0:3000").await.unwrap();
    axum::serve(listener, app).await.unwrap();
}
