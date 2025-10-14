pub mod db;
pub mod load_env;
pub mod auth;
pub mod commands;

use commands::env::c_get_env_value;
use commands::auth::c_login_user;
use db::connect::{connect_db, PgPoolWrapper};
use db::warmup::warmup_db;
use load_env::init_env;

use sqlx::PgPool;
use tokio::runtime::Runtime;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    // 환경변수 경로 설정
    init_env();
    // 데이터베이스 풀 전역설정
    let  pool:PgPool = Runtime::new()
        .unwrap()
        .block_on(connect_db());
    Runtime::new()
        .unwrap()
        .block_on(warmup_db(&pool));

    tauri::Builder::default()
        . manage(PgPoolWrapper{pool})
        // 플러그인 등록
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_google_auth::init())
        // command 등록
        .invoke_handler(tauri::generate_handler![
            c_get_env_value,
            c_login_user])
        // 실행
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}