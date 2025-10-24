/***********************************************************
 env.rs는 실행 환경별 설정을 불러오고
 환경 변수를 안전하게 조회하는 기능을 제공한다

 1. init_env()
    - 플랫폼 (Android / Desktop)에 맞게 .env 파일을 로드
    - 애플리케이션 시작 전에 환경 변수를 메모리에 등록

 2. get_env_value()
    - 이름으로 환경변수 값을 조회한다
 **********************************************************/

 // init_env()
 // 기능: 실행 환경에 맞게 .env 파일을 로드
 // 입력: X
 // 출력: X
pub fn init_env() {
    // 안드로이드일 때
    if cfg!(target_os = "android") {
        let prod_env = include_str!("../../.env");
        dotenvy::from_read(prod_env.as_bytes()).ok();
    } 
    // 안드로이드가 아닐 때
    else {
        dotenvy::from_filename(".env").ok();
    }
}



// get_env_value()
// 기능: 환경 변수 이름으로 값을 조회
// 입력: name (환경 변수 이름)
// 출력: 환경 변수 값 (String)
pub fn get_env_value(name: &str) -> String {
    std::env::var(String::from(name)).unwrap_or(String::from(""))
}