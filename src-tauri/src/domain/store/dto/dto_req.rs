use serde::Deserialize;

#[derive(Deserialize)]
pub struct GoodIdRes {
    pub good_id: i32,
}