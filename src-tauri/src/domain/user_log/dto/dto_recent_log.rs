use sqlx::prelude::FromRow;

/// 선택 기록에서 선호 유형만 조회할 때 사용하는 구조체
/// 
/// # Fields
/// * `preference_type` - 사용자가 선택한 선호 유형 ("price" | "distance")
#[derive(FromRow)]
pub struct LogRow {
    pub preference_type: String,
}
