pub mod db;
pub mod get_env;
pub mod oauth;

use db::connect::{connect_db, PgPoolWrapper};
use db::users::print_all_users;
use get_env::{init_env, get_env};
use oauth::google::verify_google_id_token;

use sqlx::PgPool;
use tokio::runtime::Runtime;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    init_env();
    let  pool:PgPool = Runtime::new()
        .unwrap()
        .block_on(connect_db());

    tauri::Builder::default()
        . manage(PgPoolWrapper{pool})
        // 플러그인 등록
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_google_auth::init())
        // command 등록
        .invoke_handler(tauri::generate_handler![
            print_all_users,
            get_env,
            verify_google_id_token])
        // 실행
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}