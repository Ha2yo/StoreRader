use serde::Deserialize;

#[derive(Deserialize)]
pub struct GoogleLoginReq {
    pub id_token: String,
    pub client_id: String,
}