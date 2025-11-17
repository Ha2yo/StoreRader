/************************************************************************
 * File: commands/env.rs
 * Description:
 *     프론트엔드에서 환경 변수 값을 요청할 때 사용되는
 *     커맨드를 정의한다.
************************************************************************/

use crate::config::env::get_env_value;

#[tauri::command]
pub fn c_get_env_value(name: &str) -> String {
    get_env_value(name)
}