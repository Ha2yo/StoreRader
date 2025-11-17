/************************************************************************
 * File: config/env.rs
 * Description:
 *     실행 환경별 설정을 불러오고,
 *     환경 변수를 조회하는 기능을 제공한다.
 *
 * Reponsibilities:
 *     1) init_env()
 *         - 플랫폼(Android / Desktop)에 맞춰 .env 파일을 로드
 *         - 애플리케이션 시작 전 환경 변수를 메모리에 등록
 * 
 *     2) get_env_value()
 *         - 환경 변수 이름(String)으로 값을 조회하여 반환
************************************************************************/

 /// 실행 환경에 맞게 .env 파일을 로드한다. 
pub fn init_env() {
    if cfg!(target_os = "android") {
        let prod_env = include_str!("../../.env");
        dotenvy::from_read(prod_env.as_bytes()).ok();
    } 
    else {
        dotenvy::from_filename(".env").ok();
    }
}

/// 환경 변수 이름으로 값을 조회하여 반환한다.
/// 
/// # Arguments
/// * `name` - 조회할 환경 변수 이름
/// 
/// # Returns
/// 환경 변수 값. 존재하지 않을 경우 빈 문자열("")을 반환한다.
pub fn get_env_value(name: &str) -> String {
    std::env::var(String::from(name)).unwrap_or(String::from(""))
}