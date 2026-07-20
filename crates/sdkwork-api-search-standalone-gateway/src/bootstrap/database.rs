//! Database pool connection helpers.

use sqlx::PgPool;

/// Connect a PostgreSQL connection pool from the supplied URL.
pub async fn connect_database_pool(database_url: &str) -> anyhow::Result<PgPool> {
    let pool = sqlx::postgres::PgPoolOptions::new()
        .max_connections(10)
        .connect(database_url)
        .await
        .map_err(|err| anyhow::anyhow!("failed to connect to database: {err}"))?;
    tracing::info!("database pool connected");
    Ok(pool)
}
