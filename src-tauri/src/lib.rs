/************************************************************************
 * File: lib.rs
 * Description:
 *     StoreRader의 핵심 모듈을 통합하며,
 *     Tauri 애플리케이션의 실행 환경을 구성하고 실행을 담당한다.
 *
 * Reponsibilities:
 *     1) 환경 변수 초기화 (init_env)
 * 
 *     2) 필수 플러그인 등록 (opener, google_auth 등)
 * 
 *     3) Tauri Cmmand 등록 (invoke_handler)
 * 
 *     4) 애플리케이션 실행 및 에러 처리
************************************************************************/

pub mod domain;
pub mod commands;
pub mod config;
pub mod common;

use commands::env::c_get_env_value;
use config::env::init_env;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    init_env();

    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_google_auth::init())
        .invoke_handler(tauri::generate_handler![c_get_env_value,])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
