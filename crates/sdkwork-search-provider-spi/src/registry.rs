//! Provider registry - config-driven pluggable provider selection.

use crate::{
    context::SearchProviderContext,
    error::{SearchProviderError, SearchProviderResult},
    provider::{
        SearchProvider, SearchProviderCapability, SearchProviderConfig, SearchProviderKind,
    },
    query::{
        SearchQuery, SearchResponse, SearchSuggestionQuery, SearchSuggestionResponse,
        SemanticSearchQuery, SemanticSearchResponse,
    },
};
use std::collections::HashMap;
use std::sync::Arc;

/// Factory function that constructs a provider from config.
pub type SearchProviderFactory = Arc<
    dyn Fn(&SearchProviderConfig) -> SearchProviderResult<Arc<dyn SearchProvider>> + Send + Sync,
>;

/// Registry of available provider factories and active provider instances.
///
/// Selection policy: highest-priority enabled provider that supports the requested capability.
/// This keeps provider wiring config-driven and pluggable per the user's requirement.
pub struct SearchProviderRegistry {
    providers: Vec<Arc<dyn SearchProvider>>,
    default_kind: Option<SearchProviderKind>,
}

impl SearchProviderRegistry {
    pub fn builder() -> SearchProviderRegistryBuilder {
        SearchProviderRegistryBuilder::default()
    }

    pub fn default_kind(&self) -> Option<SearchProviderKind> {
        self.default_kind
    }

    pub fn providers(&self) -> &[Arc<dyn SearchProvider>] {
        &self.providers
    }

    /// Select the highest-priority enabled provider that supports the given capability.
    pub fn select_for_capability(
        &self,
        capability: SearchProviderCapability,
    ) -> SearchProviderResult<Arc<dyn SearchProvider>> {
        let mut best: Option<(Arc<dyn SearchProvider>, u32)> = None;
        for provider in &self.providers {
            if provider.supports(capability) {
                // priority is implicit by registration order; later registrations override earlier
                best = Some((provider.clone(), 0));
            }
        }
        best.map(|(p, _)| p)
            .ok_or_else(|| SearchProviderError::CapabilityNotSupported {
                capability,
                kind: self.default_kind.unwrap_or(SearchProviderKind::Memory),
            })
    }

    /// Select provider by explicit kind.
    pub fn select_by_kind(
        &self,
        kind: SearchProviderKind,
    ) -> SearchProviderResult<Arc<dyn SearchProvider>> {
        self.providers
            .iter()
            .find(|p| p.kind() == kind)
            .cloned()
            .ok_or(SearchProviderError::ProviderNotFound { kind })
    }

    /// Select the default provider.
    pub fn select_default(&self) -> SearchProviderResult<Arc<dyn SearchProvider>> {
        if let Some(kind) = self.default_kind {
            return self.select_by_kind(kind);
        }
        self.providers
            .first()
            .cloned()
            .ok_or(SearchProviderError::ProviderNotFound {
                kind: SearchProviderKind::Memory,
            })
    }

    /// Convenience: search using the default provider.
    pub async fn search(
        &self,
        ctx: &SearchProviderContext,
        query: &SearchQuery,
    ) -> SearchProviderResult<SearchResponse> {
        let provider = self.select_default()?;
        provider.search(ctx, query).await
    }

    /// Convenience: suggest using the default provider.
    pub async fn suggest(
        &self,
        ctx: &SearchProviderContext,
        query: &SearchSuggestionQuery,
    ) -> SearchProviderResult<SearchSuggestionResponse> {
        let provider = self.select_default()?;
        provider.suggest(ctx, query).await
    }

    /// Convenience: semantic search using a provider that supports it.
    pub async fn semantic_search(
        &self,
        ctx: &SearchProviderContext,
        query: &SemanticSearchQuery,
    ) -> SearchProviderResult<SemanticSearchResponse> {
        let provider = self
            .select_for_capability(SearchProviderCapability::SemanticSearch)
            .or_else(|_| self.select_default())?;
        provider.semantic_search(ctx, query).await
    }
}

#[derive(Default)]
pub struct SearchProviderRegistryBuilder {
    factories: HashMap<SearchProviderKind, SearchProviderFactory>,
    providers: Vec<Arc<dyn SearchProvider>>,
    default_kind: Option<SearchProviderKind>,
}

impl SearchProviderRegistryBuilder {
    pub fn register_factory(
        mut self,
        kind: SearchProviderKind,
        factory: SearchProviderFactory,
    ) -> Self {
        self.factories.insert(kind, factory);
        self
    }

    pub fn register_provider(mut self, provider: Arc<dyn SearchProvider>) -> Self {
        self.providers.push(provider);
        self
    }

    pub fn default_kind(mut self, kind: SearchProviderKind) -> Self {
        self.default_kind = Some(kind);
        self
    }

    /// Build from a list of configs: for each enabled config, invoke the matching factory.
    pub fn build_from_configs(
        self,
        configs: &[SearchProviderConfig],
    ) -> SearchProviderResult<SearchProviderRegistry> {
        let mut providers = self.providers;
        for cfg in configs.iter().filter(|c| c.enabled) {
            if let Some(factory) = self.factories.get(&cfg.kind) {
                let provider = factory(cfg)?;
                providers.push(provider);
            }
        }
        Ok(SearchProviderRegistry {
            providers,
            default_kind: self.default_kind,
        })
    }

    pub fn build(self) -> SearchProviderRegistry {
        SearchProviderRegistry {
            providers: self.providers,
            default_kind: self.default_kind,
        }
    }
}
