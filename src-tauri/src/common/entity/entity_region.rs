use sqlx::FromRow;

#[derive(Debug, FromRow)]
pub struct RegionEntity {
    pub code: String,
    pub name: String,
    pub parent_code: Option<String>,
    pub level: i16,
}