//! Service container holding the four search service handles.

use std::sync::Arc;

use sdkwork_search_indexing_service::IndexingService;
use sdkwork_search_promotion_service::PromotionService;
use sdkwork_search_query_service::QueryService;
use sdkwork_search_recommendation_service::RecommendationService;

/// Container holding `Arc` handles to the four search services.
///
/// Constructed by the caller (e.g. a native host or embedded runtime) after the
/// provider registry and repositories have been assembled. The container does
/// not own HTTP routes — it is the in-process service surface per
/// `RUST_CODE_SPEC.md` service host contract.
#[derive(Clone)]
pub struct SearchServiceContainer {
    query_service: Arc<QueryService>,
    indexing_service: Arc<IndexingService>,
    recommendation_service: Arc<RecommendationService>,
    promotion_service: Arc<PromotionService>,
}

impl SearchServiceContainer {
    /// Create a new container from pre-constructed service handles.
    pub fn new(
        query_service: Arc<QueryService>,
        indexing_service: Arc<IndexingService>,
        recommendation_service: Arc<RecommendationService>,
        promotion_service: Arc<PromotionService>,
    ) -> Self {
        Self {
            query_service,
            indexing_service,
            recommendation_service,
            promotion_service,
        }
    }

    pub fn query_service(&self) -> &Arc<QueryService> {
        &self.query_service
    }

    pub fn indexing_service(&self) -> &Arc<IndexingService> {
        &self.indexing_service
    }

    pub fn recommendation_service(&self) -> &Arc<RecommendationService> {
        &self.recommendation_service
    }

    pub fn promotion_service(&self) -> &Arc<PromotionService> {
        &self.promotion_service
    }
}
