//! Preflight checks run before the HTTP listener starts accepting traffic.

pub mod database;
pub mod providers;

use std::sync::Arc;

use sdkwork_search_provider_spi::SearchProviderRegistry;
use sqlx::PgPool;

use crate::bootstrap::SearchApiServerConfig;

/// Run all preflight checks: database connectivity and provider health.
pub async fn run_preflight(
    pool: &PgPool,
    provider_registry: &Arc<SearchProviderRegistry>,
    config: &SearchApiServerConfig,
) -> anyhow::Result<()> {
    tracing::info!("running sdkwork-api-search-standalone-gateway preflight checks");
    database::check_database(pool).await?;
    providers::check_providers(provider_registry).await?;
    let _ = config;
    tracing::info!("preflight checks passed");
    Ok(())
}
