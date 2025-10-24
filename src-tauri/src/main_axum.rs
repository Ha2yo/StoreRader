use axum::{ routing::{get, post}, Router };
use reqwest::Method;
use tower_http::cors::{Any, CorsLayer};
use tracing_subscriber::{layer::SubscriberExt, util::SubscriberInitExt};

use storerader_lib::{auth::handler::auth_google_handler, config::database::connect_db};
use storerader_lib::config::env::init_env;

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

    // DB 풀 생성
    let pool = connect_db().await;

    // CORS
    let cors = CorsLayer::new()
        .allow_origin(Any)
        .allow_methods([
            Method::GET,
            Method::POST,
            Method::OPTIONS,
        ])
        .allow_headers(Any);

    // 라우터
    let app = Router::new()
        .route("/", get(|| async { "OK" }))
        .route("/auth/google", post(auth_google_handler))
        .layer(cors)
        .with_state(pool.clone());
        
    tracing::info!("Server started on http://localhost:3000");
    
    let listener = tokio::net::TcpListener::bind("0.0.0.0:3000").await.unwrap();
    axum::serve(listener, app).await.unwrap();
}
