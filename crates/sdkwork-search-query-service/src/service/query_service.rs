//! Query service - search/suggest/semantic search orchestration.

use std::sync::Arc;

use sdkwork_search_provider_spi::{
    SearchProviderContext, SearchProviderRegistry, SearchQuery, SearchResponse,
    SearchSuggestionQuery, SearchSuggestionResponse, SemanticSearchQuery, SemanticSearchResponse,
};
use tracing::debug;

use crate::error::{QueryServiceError, QueryServiceResult};
use crate::ports::SearchQueryRepositoryPort;

/// Orchestrates query execution against the provider registry and records audit/user events.
pub struct QueryService {
    provider_registry: Arc<SearchProviderRegistry>,
    repository: Arc<dyn SearchQueryRepositoryPort>,
}

impl QueryService {
    pub fn new(
        provider_registry: Arc<SearchProviderRegistry>,
        repository: Arc<dyn SearchQueryRepositoryPort>,
    ) -> Self {
        Self {
            provider_registry,
            repository,
        }
    }

    /// Execute a full-text search through the default provider.
    pub async fn execute_query(
        &self,
        ctx: &SearchProviderContext,
        query: SearchQuery,
    ) -> QueryServiceResult<SearchResponse> {
        debug!(index_key = %query.index_key, "executing query");
        let response = self.provider_registry.search(ctx, &query).await?;
        Ok(response)
    }

    /// Execute a semantic search through a semantic-capable provider.
    pub async fn execute_semantic(
        &self,
        ctx: &SearchProviderContext,
        query: SemanticSearchQuery,
    ) -> QueryServiceResult<SemanticSearchResponse> {
        debug!(index_key = %query.index_key, "executing semantic search");
        let response = self.provider_registry.semantic_search(ctx, &query).await?;
        Ok(response)
    }

    /// Retrieve autocomplete suggestions.
    pub async fn get_suggestions(
        &self,
        ctx: &SearchProviderContext,
        query: SearchSuggestionQuery,
    ) -> QueryServiceResult<SearchSuggestionResponse> {
        debug!(index_key = %query.index_key, "retrieving suggestions");
        let response = self.provider_registry.suggest(ctx, &query).await?;
        Ok(response)
    }

    /// List recent query texts for the context tenant/organization.
    pub async fn list_recent_queries(
        &self,
        ctx: &SearchProviderContext,
        limit: u32,
    ) -> QueryServiceResult<Vec<String>> {
        self.repository
            .list_recent_queries(ctx, limit)
            .await
            .map_err(QueryServiceError::Repository)
    }

    /// 记录用户搜索事件用于分析/推荐。
    pub async fn record_user_event(
        &self,
        ctx: &SearchProviderContext,
        event_kind: &str,
        payload: &serde_json::Value,
    ) -> QueryServiceResult<()> {
        self.repository
            .record_user_event(ctx, event_kind, payload)
            .await
            .map_err(QueryServiceError::Repository)
    }
}
