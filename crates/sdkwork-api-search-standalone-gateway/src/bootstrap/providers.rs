//! Search provider registry assembly.
//!
//! Registers the in-process Memory provider as default. PostgreSQL provider is registered
//! when a connection URL is supplied via `SearchProviderConfig`.

use std::sync::Arc;

use sdkwork_search_provider_spi::{
    provider::{SearchProviderConfig, SearchProviderKind},
    registry::{SearchProviderRegistry, SearchProviderRegistryBuilder},
    SearchProvider,
};

/// Build the `SearchProviderRegistry` from the supplied provider configs.
///
/// The Memory provider is always registered as the default so the server can serve traffic
/// without an external search engine. PostgreSQL provider is registered when a config with
/// `kind = Postgresql` and a valid `connection.url` is supplied.
pub fn build_provider_registry(
    configs: &[SearchProviderConfig],
) -> anyhow::Result<Arc<SearchProviderRegistry>> {
    let mut builder = SearchProviderRegistryBuilder::default();

    // Always register Memory provider as default.
    let memory_provider: Arc<dyn SearchProvider> = Arc::new(
        sdkwork_search_provider_memory::MemorySearchProvider::new("memory-default"),
    );
    builder = builder
        .register_provider(memory_provider)
        .default_kind(SearchProviderKind::Memory);

    // Register PostgreSQL provider when configured.
    for cfg in configs
        .iter()
        .filter(|c| c.enabled && c.kind == SearchProviderKind::Postgresql)
    {
        let factory = sdkwork_search_provider_postgresql::factory();
        if let Ok(provider) = factory(cfg) {
            builder = builder.register_provider(provider);
        }
    }

    // Register Memory provider factory for future config-driven instantiation.
    builder = builder.register_factory(
        SearchProviderKind::Memory,
        sdkwork_search_provider_memory::factory(),
    );
    builder = builder.register_factory(
        SearchProviderKind::Postgresql,
        sdkwork_search_provider_postgresql::factory(),
    );

    let registry = builder.build();
    tracing::info!("search provider registry built with memory default");
    Ok(Arc::new(registry))
}
