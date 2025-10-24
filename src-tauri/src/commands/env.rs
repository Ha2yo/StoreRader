use crate::config::env::get_env_value;

#[tauri::command]
pub fn c_get_env_value(name: &str) -> String {
    get_env_value(name)
}