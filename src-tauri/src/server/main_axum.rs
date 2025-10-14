use axum::{
    response::IntoResponse,
    routing::get,
    Json, Router,
};
use serde::Serialize;
use std::net::SocketAddr;
use tower_http::cors::{Any, CorsLayer};
use tracing_subscriber::{layer::SubscriberExt, util::SubscriberInitExt};
use axum::http::Method;

#[derive(Serialize, Clone)]
struct UserDto {
    id: i32,
    name: &'static str,
    email: &'static str,
}

#[tokio::main]
async fn main() {
    // 로그
    tracing_subscriber::registry()
        .with(tracing_subscriber::EnvFilter::new(
            std::env::var("RUST_LOG")
                .unwrap_or_else(|_| "server=debug,axum=info".into()),
        ))
        .with(tracing_subscriber::fmt::layer())
        .init();

    let cors = CorsLayer::new()
        .allow_methods([Method::GET, Method::POST, Method::PUT, Method::DELETE, Method::OPTIONS])
        .allow_origin(Any)
        .allow_headers(Any);

    let app = Router::new()
        .route("/ping", get(|| async { "pong" }))   // 유일한 테스트용
        .route("/users", get(list_users))           // 유저 예제 (이후 DB로 연결)
        .layer(cors);

    let addr = SocketAddr::from(([0, 0, 0, 0], 3000));
    tracing::info!("StoreRader API started on http://{}", addr);

    axum::serve(tokio::net::TcpListener::bind(addr).await.unwrap(), app)
        .await
        .unwrap();
}

async fn list_users() -> impl IntoResponse {
    let users = vec![
        UserDto { id: 1, name: "Alice", email: "alice@example.com" },
        UserDto { id: 2, name: "Bob", email: "bob@example.com"   },
    ];
    Json(users)
}
