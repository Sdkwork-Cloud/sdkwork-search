//! Provider health preflight checks.

use std::sync::Arc;

use sdkwork_search_provider_spi::SearchProviderRegistry;

/// Verify every registered provider reports healthy before the server starts.
pub async fn check_providers(registry: &Arc<SearchProviderRegistry>) -> anyhow::Result<()> {
    for provider in registry.providers() {
        let healthy = provider.health().await.map_err(|err| {
            anyhow::anyhow!("provider {} health check failed: {err}", provider.id())
        })?;
        if !healthy {
            anyhow::bail!("provider {} reported unhealthy", provider.id());
        }
        tracing::info!(
            provider_id = provider.id(),
            "provider preflight check passed"
        );
    }
    Ok(())
}
