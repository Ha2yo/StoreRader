pub mod db;
pub mod env;
pub mod auth;
pub mod commands;
pub mod routes;

use commands::env::c_get_env_value;

// use commands::auth::c_login_user;
use env::init_env;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    // 환경변수 경로 설정
    init_env();
    tauri::Builder::default()
        // 플러그인 등록
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_google_auth::init())
        // command 등록
        .invoke_handler(tauri::generate_handler![
            c_get_env_value,
            // c_login_user])
        ])
        // 실행
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}