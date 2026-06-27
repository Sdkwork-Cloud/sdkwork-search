//! Repository port for promotion persistence and stats.

use async_trait::async_trait;
use sdkwork_search_provider_spi::SearchProviderContext;

use crate::domain::{CreatePromotionInput, Promotion, PromotionPlacement, UpdatePromotionInput};

/// Persistence port for active promotions, delivery records, and click tracking.
///
/// Implementations live in repository crates (e.g. SQLx). The service layer calls these methods to
/// resolve active promotions, record deliveries, and track engagement.
#[async_trait]
pub trait PromotionRepositoryPort: Send + Sync {
    /// List active promotions for the given index and placement.
    async fn list_active_promotions(
        &self,
        ctx: &SearchProviderContext,
        index_key: &str,
        placement: PromotionPlacement,
    ) -> Result<Vec<Promotion>, String>;

    /// Record a promotion delivery to a user.
    async fn record_delivery(
        &self,
        ctx: &SearchProviderContext,
        promotion_id: &str,
        user_id: i64,
    ) -> Result<(), String>;

    /// Record a promotion click by a user.
    async fn record_click(
        &self,
        ctx: &SearchProviderContext,
        promotion_id: &str,
        user_id: i64,
    ) -> Result<(), String>;

    /// Get aggregate stats for a promotion (impressions, clicks, etc.).
    async fn get_promotion_stats(
        &self,
        ctx: &SearchProviderContext,
        promotion_id: &str,
    ) -> Result<serde_json::Value, String>;

    /// 创建一条推广配置并返回持久化后的领域模型。
    async fn create_promotion(
        &self,
        ctx: &SearchProviderContext,
        input: &CreatePromotionInput,
    ) -> Result<Promotion, String>;

    /// 按 `promotion_id`（即 `promotion_key`）更新推广字段，返回更新后的领域模型。
    async fn update_promotion(
        &self,
        ctx: &SearchProviderContext,
        promotion_id: &str,
        patch: &UpdatePromotionInput,
    ) -> Result<Promotion, String>;

    /// 软删除推广。
    async fn delete_promotion(
        &self,
        ctx: &SearchProviderContext,
        promotion_id: &str,
    ) -> Result<(), String>;

    /// 分页列出索引下全部推广（含未活跃）。
    async fn list_all_promotions(
        &self,
        ctx: &SearchProviderContext,
        index_key: &str,
        page: u32,
        page_size: u32,
    ) -> Result<Vec<Promotion>, String>;

    /// 按 `promotion_id`（即 `promotion_key`）查询单个推广，不存在返回 `None`。
    async fn get_promotion(
        &self,
        ctx: &SearchProviderContext,
        promotion_id: &str,
    ) -> Result<Option<Promotion>, String>;
}
