//! Repository port for recommendation user events and trending data.

use async_trait::async_trait;
use sdkwork_search_provider_spi::SearchProviderContext;

use crate::domain::RecommendationItem;

/// Persistence port for user events, trending items, and recommendation records.
///
/// Implementations live in repository crates (e.g. SQLx). The service layer calls these methods to
/// source recommendation candidates and record delivered recommendations.
#[async_trait]
pub trait RecommendationRepositoryPort: Send + Sync {
    /// Get recent user events as recommendation candidates.
    async fn get_user_events(
        &self,
        ctx: &SearchProviderContext,
        user_id: i64,
        limit: u32,
    ) -> Result<Vec<RecommendationItem>, String>;

    /// Get trending items for the given index.
    async fn get_trending(
        &self,
        ctx: &SearchProviderContext,
        index_key: &str,
        limit: u32,
    ) -> Result<Vec<RecommendationItem>, String>;

    /// 获取与指定文档有共同用户行为的相似文档（item-based 协同过滤）。
    ///
    /// 基于"看过这些文档的其他用户也看了什么"计算相似文档，排除用户已交互的文档。
    /// 租户隔离由 `ctx.tenant_id` + `ctx.organization_id` 过滤保证。
    async fn get_similar_documents(
        &self,
        ctx: &SearchProviderContext,
        index_key: &str,
        document_ids: &[String],
        limit: u32,
    ) -> Result<Vec<RecommendationItem>, String>;

    /// Get the user profile used to derive content-based queries.
    async fn get_user_profile(
        &self,
        ctx: &SearchProviderContext,
        user_id: i64,
    ) -> Result<Option<serde_json::Value>, String>;

    /// Record a delivered recommendation set for analytics.
    async fn record_recommendation(
        &self,
        ctx: &SearchProviderContext,
        user_id: i64,
        items: &[RecommendationItem],
    ) -> Result<(), String>;
}
