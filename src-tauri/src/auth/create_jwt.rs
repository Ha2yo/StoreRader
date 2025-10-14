use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize)]
struct Claims {
    exp: usize,
    sub: String,    // 고유 ID (user 테이블의 id 값)
}

