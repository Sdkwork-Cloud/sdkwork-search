//! Database schema constants, row types, and pool helpers.
//!
//! Per `RUST_CODE_SPEC.md`, `db/` owns table/column constants and database row
//! types. API DTOs and domain models are defined by the service/SPI layer and
//! must not be aliases for these row types.

pub mod rows;
pub mod schema;

use crate::error::RepositoryError;

/// Extract a PostgreSQL pool from a unified [`sdkwork_database_sqlx::DatabasePool`].
///
/// Search indexing queries rely on PostgreSQL-specific features (`tsvector`,
/// `pg_trgm`, `pgvector`) and therefore require a PostgreSQL pool. SQLite pools
/// are rejected with a [`RepositoryError::Configuration`].
pub fn pg_pool_from_database_pool(
    pool: &sdkwork_database_sqlx::DatabasePool,
) -> Result<sqlx::PgPool, RepositoryError> {
    pool.as_postgres().cloned().ok_or_else(|| {
        RepositoryError::Configuration(
            "search indexing repository requires a PostgreSQL pool".into(),
        )
    })
}

/// Extract a PostgreSQL pool from a [`sdkwork_search_database_host::SearchDatabaseHost`].
pub fn pg_pool_from_host(
    host: &sdkwork_search_database_host::SearchDatabaseHost,
) -> Result<sqlx::PgPool, RepositoryError> {
    pg_pool_from_database_pool(host.pool())
}
