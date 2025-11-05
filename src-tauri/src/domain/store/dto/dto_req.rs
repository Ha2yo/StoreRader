use serde::Deserialize;

#[derive(Deserialize)]
pub struct GoodIdReq {
    pub good_id: i32,
}