/***********************************************************
 lib.rs는 StoreRader의 핵심 모듈들을 통합하고
 Tauri 애플리케이션 실행을 담당한다

 1. fn run()
    - 애플리케이션의 메인 실행 함수
    - 수행 내용:
      1) 환경 변수 초기화
      2) 필수 플러그인 등록
      3) Tauri 명령(command) 등록
      4) 앱 실행 및 에러 핸들링
***********************************************************/

pub mod domain;
pub mod commands; // Tauri에서 호출 가능한 커맨드 정의
pub mod config; // 환경 변수 초기화 및 설정 관련 기능 관리
pub mod common;

use commands::env::c_get_env_value;
use config::env::init_env;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    // 환경 변수 경로 설정
    init_env();

    tauri::Builder::default()
        // 플러그인 등록
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_google_auth::init())
        .plugin(tauri_plugin_geolocation::init())
        // command 등록
        .invoke_handler(tauri::generate_handler![c_get_env_value,])
        // 실행
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
