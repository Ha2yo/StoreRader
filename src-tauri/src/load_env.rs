pub fn get_env_value(name: &str) -> String {
    std::env::var(String::from(name)).unwrap_or(String::from(""))
}

pub fn init_env() {
    // 안드로이드일 때
    if cfg!(target_os = "android") {
        let prod_env = include_str!("../.env");
        dotenvy::from_read(prod_env.as_bytes()).ok();
    } 
    // 안드로이드가 아닐 때
    else {
        dotenvy::from_filename(".env").ok();
    }
}