use sqlx::FromRow;

#[derive(Debug, FromRow, Clone)]
pub struct RegionEntity {
    pub code: String,
    pub name: String,
    pub parent_code: String,
    pub level: i16,
}