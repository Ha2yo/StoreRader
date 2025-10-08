pub mod db;
pub mod get_env;
use db::users::print_all_users;
use get_env::{init_env, get_env};

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    init_env();

    tauri::Builder::default()
        // 플러그인 등록
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_google_auth::init())
        // commands 등록
        .invoke_handler(tauri::generate_handler![
            print_all_users,
            get_env])
        // 실행
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
