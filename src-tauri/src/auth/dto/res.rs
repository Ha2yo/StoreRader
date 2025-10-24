use serde::Serialize;

#[derive(Serialize)]
pub struct UserRes {
    pub id: i32,
    pub name: String,
    pub email: String,
}

#[derive(Serialize)]
pub struct GoogleLoginRes {
    pub jwt: String,
    pub user: UserRes,
}