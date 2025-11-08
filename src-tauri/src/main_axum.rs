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
        auth::handler::auth_google_handler, good::handler::get_all_goods_handler, preference::handler::get_user_preference_handler, price::handler::get_prices_handler, region::handler::get_all_region_codes_handler, store::handler::{get_all_stores_handler}, sync::handler::{upsert_api_data_handler, upsert_prices_handler, upsert_region_codes_handler}
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

    // "/auth..."
    let auth_routes = Router::new()
        // id token 검증 후 서버 자체 JWT 발급
        .route("/auth/google", post(auth_google_handler));

    // "/sync..."
    let sync_routes = Router::new()
        // 상품정보와 매장정보를 공공데이터 API에서 받아 DB에 저장
        .route("/sync/goodsAndStores", get(upsert_api_data_handler))
        // 지역별 코드를 공공데이터 API에서 받아 DB에 저장
        .route("/sync/regionCodes", get(upsert_region_codes_handler))
        // 매장별 가격정보를 공공데이터 API에서 받아 DB에 저장
        .route("/sync/Prices", get(upsert_prices_handler));

    // "/get..."
    let get_routes = Router::new()
        // DB에 저장된 모든 매장정보를 요청
        .route("/get/StoreInfo/all", get(get_all_stores_handler))
        // DB에 저장된 모든 상품정보를 요청
        .route("/get/GoodInfo/all", get(get_all_goods_handler))
        // DB에 저장된 매장별 가격 정보를 요청 (유저가 입력한 상품명에 관한 가격 정보)
        .route("/get/PriceInfo", get(get_prices_handler))
        // DB에 저장된 모든 지역별 코드 정보를 요청
        .route("/get/RegionCodeInfo/all", get(get_all_region_codes_handler))
        // DB에 저장된 유저별 선호도 정보를 요청
        .route("/get/userPreferenceInfo", post(get_user_preference_handler));
    // 루트 라우터 설정
    let app = Router::new()
        .route("/", get(|| async { "OK" }))
        .merge(sync_routes)
        .merge(auth_routes)
        .merge(get_routes)
        .layer(cors)
        .with_state(pool.clone());
    
    // 서버 실행
    tracing::info!("서버가 http://localhost:3000에서 시작되었습니다");
    let listener = tokio::net::TcpListener::bind("0.0.0.0:3000").await.unwrap();
    axum::serve(listener, app).await.unwrap();
}
