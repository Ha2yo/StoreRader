/***********************************************************
 main.rs는 StoreRader 애플리케이션의 진입점 역할을 수행한다

 1. fn main()
    - 프로그램의 시작 지점
    - storerader_lib::run() 함수를 호출하여
      실제 애플리케이션 초기화 및 실행 로직 수행
***********************************************************/

#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

fn main() {
    storerader_lib::run()
}
