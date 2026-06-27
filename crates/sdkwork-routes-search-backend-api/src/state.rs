//! Search backend-api route state (`WEB_BACKEND_SPEC.md` §4.2).
//!
//! 持有 provider registry 与 4 个 service 的 Arc 引用，供 handler 直接调用。
//! 真实 state 由 standalone-gateway 在 bootstrap 阶段注入。

use std::sync::Arc;

use sdkwork_search_indexing_service::IndexingService;
use sdkwork_search_promotion_service::PromotionService;
use sdkwork_search_provider_spi::SearchProviderRegistry;
use sdkwork_search_query_service::QueryService;
use sdkwork_search_recommendation_service::RecommendationService;

#[derive(Clone)]
pub struct SearchBackendState {
    pub provider_registry: Arc<SearchProviderRegistry>,
    pub query_service: Arc<QueryService>,
    pub indexing_service: Arc<IndexingService>,
    pub recommendation_service: Arc<RecommendationService>,
    pub promotion_service: Arc<PromotionService>,
}

impl SearchBackendState {
    pub fn new(
        provider_registry: Arc<SearchProviderRegistry>,
        query_service: Arc<QueryService>,
        indexing_service: Arc<IndexingService>,
        recommendation_service: Arc<RecommendationService>,
        promotion_service: Arc<PromotionService>,
    ) -> Self {
        Self {
            provider_registry,
            query_service,
            indexing_service,
            recommendation_service,
            promotion_service,
        }
    }
}
