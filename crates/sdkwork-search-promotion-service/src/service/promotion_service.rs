//! Promotion service - promoted result delivery and click tracking.

use std::sync::Arc;

use chrono::Utc;
use sdkwork_search_provider_spi::SearchProviderContext;
use tracing::debug;

use crate::domain::{
    CreatePromotionInput, Promotion, PromotionDelivery, PromotionPlacement, UpdatePromotionInput,
};
use crate::error::{PromotionServiceError, PromotionServiceResult};
use crate::ports::PromotionRepositoryPort;

/// Resolves active promotions, records deliveries, and tracks clicks.
pub struct PromotionService {
    repository: Arc<dyn PromotionRepositoryPort>,
}

impl PromotionService {
    pub fn new(repository: Arc<dyn PromotionRepositoryPort>) -> Self {
        Self { repository }
    }

    /// List active promotions for the given index and placement.
    pub async fn list_promotions(
        &self,
        ctx: &SearchProviderContext,
        index_key: &str,
        placement: PromotionPlacement,
    ) -> PromotionServiceResult<Vec<Promotion>> {
        debug!(%index_key, ?placement, "listing promotions");
        self.repository
            .list_active_promotions(ctx, index_key, placement)
            .await
            .map_err(PromotionServiceError::Repository)
    }

    /// Deliver a promotion to a user, recording the delivery.
    pub async fn deliver_promotion(
        &self,
        ctx: &SearchProviderContext,
        promotion_id: &str,
        user_id: i64,
    ) -> PromotionServiceResult<PromotionDelivery> {
        debug!(%promotion_id, user_id, "delivering promotion");
        self.repository
            .record_delivery(ctx, promotion_id, user_id)
            .await
            .map_err(PromotionServiceError::Repository)?;
        Ok(PromotionDelivery {
            promotion_id: promotion_id.to_string(),
            user_id,
            delivered_at: Utc::now(),
            placement: PromotionPlacement::Inline,
        })
    }

    /// Record a promotion click by a user.
    pub async fn record_click(
        &self,
        ctx: &SearchProviderContext,
        promotion_id: &str,
        user_id: i64,
    ) -> PromotionServiceResult<()> {
        debug!(%promotion_id, user_id, "recording promotion click");
        self.repository
            .record_click(ctx, promotion_id, user_id)
            .await
            .map_err(PromotionServiceError::Repository)
    }

    /// 创建推广配置，委托到 repository。
    pub async fn create_promotion(
        &self,
        ctx: &SearchProviderContext,
        input: &CreatePromotionInput,
    ) -> PromotionServiceResult<Promotion> {
        debug!(promotion_key = %input.promotion_key, "creating promotion");
        self.repository
            .create_promotion(ctx, input)
            .await
            .map_err(PromotionServiceError::Repository)
    }

    /// 更新推广字段，委托到 repository。
    pub async fn update_promotion(
        &self,
        ctx: &SearchProviderContext,
        promotion_id: &str,
        patch: &UpdatePromotionInput,
    ) -> PromotionServiceResult<Promotion> {
        debug!(%promotion_id, "updating promotion");
        self.repository
            .update_promotion(ctx, promotion_id, patch)
            .await
            .map_err(PromotionServiceError::Repository)
    }

    /// 软删除推广，委托到 repository。
    pub async fn delete_promotion(
        &self,
        ctx: &SearchProviderContext,
        promotion_id: &str,
    ) -> PromotionServiceResult<()> {
        debug!(%promotion_id, "deleting promotion");
        self.repository
            .delete_promotion(ctx, promotion_id)
            .await
            .map_err(PromotionServiceError::Repository)
    }

    /// 分页列出索引下全部推广（含未活跃），委托到 repository。
    pub async fn list_all_promotions(
        &self,
        ctx: &SearchProviderContext,
        index_key: &str,
        page: u32,
        page_size: u32,
    ) -> PromotionServiceResult<Vec<Promotion>> {
        debug!(%index_key, page, page_size, "listing all promotions");
        self.repository
            .list_all_promotions(ctx, index_key, page, page_size)
            .await
            .map_err(PromotionServiceError::Repository)
    }

    /// 按 ID 查询单个推广，委托到 repository。
    pub async fn get_promotion(
        &self,
        ctx: &SearchProviderContext,
        promotion_id: &str,
    ) -> PromotionServiceResult<Option<Promotion>> {
        debug!(%promotion_id, "getting promotion");
        self.repository
            .get_promotion(ctx, promotion_id)
            .await
            .map_err(PromotionServiceError::Repository)
    }
}
