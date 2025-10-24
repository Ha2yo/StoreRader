/***********************************************************
 env.rs는 프론트엔드에서 환경 변수 값을 요청할 때
 호출되는 command를 정의한다

 1. c_get_env_value
    - 프론트에서 invoke를 사용하여 호출 가능하다
    - config/env.rs의 get_env_value()를 사용하여
      환경 변수 값을 반환한다

    Ex) const apiUrl = 
            await invoke<string>("c_get_env_value",
                { name: "API_URL" });
 ***********************************************************/

use crate::config::env::get_env_value;

#[tauri::command]
pub fn c_get_env_value(name: &str) -> String {
    get_env_value(name)
}