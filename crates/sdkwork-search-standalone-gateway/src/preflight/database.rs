//! Database preflight check.

use sqlx::PgPool;

/// Verify the PostgreSQL pool is reachable before the server starts.
pub async fn check_database(pool: &PgPool) -> anyhow::Result<()> {
    sqlx::query("SELECT 1")
        .execute(pool)
        .await
        .map_err(|err| anyhow::anyhow!("database preflight check failed: {err}"))?;
    tracing::info!("database preflight check passed");
    Ok(())
}
