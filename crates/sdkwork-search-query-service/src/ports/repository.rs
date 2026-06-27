//! Repository port for query audit and user event persistence.

use async_trait::async_trait;
use sdkwork_search_provider_spi::SearchProviderContext;

/// Persistence port for recording query audit entries and user search events.
///
/// Implementations live in repository crates (e.g. SQLx). The service layer calls these methods
/// to record analytics/audit data alongside provider search execution.
#[async_trait]
pub trait SearchQueryRepositoryPort: Send + Sync {
    /// List recent query texts for the context tenant/organization.
    async fn list_recent_queries(
        &self,
        ctx: &SearchProviderContext,
        limit: u32,
    ) -> Result<Vec<String>, String>;

    /// Record a query audit entry for the executed search.
    async fn record_query_audit(
        &self,
        ctx: &SearchProviderContext,
        query_text: &str,
        index_key: &str,
    ) -> Result<(), String>;

    /// Record a user event (e.g. search performed) for analytics/recommendations.
    async fn record_user_event(
        &self,
        ctx: &SearchProviderContext,
        event_kind: &str,
        payload: &serde_json::Value,
    ) -> Result<(), String>;
}
