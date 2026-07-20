//! Service construction: assembles query, indexing, recommendation, and promotion services.
//!
//! All services are backed by [`SearchRepositoryAdapter`] — a SQLx-backed adapter that
//! implements all four service port traits against the `search_*` PostgreSQL tables.

use std::sync::Arc;

use sdkwork_search_indexing_repository_sqlx::SearchRepositoryAdapter;
use sdkwork_search_indexing_service::{ports::DocumentUploadPort, IndexingService};
use sdkwork_search_promotion_service::PromotionService;
use sdkwork_search_provider_spi::SearchProviderRegistry;
use sdkwork_search_query_service::QueryService;
use sdkwork_search_recommendation_service::RecommendationService;
use sqlx::PgPool;

/// Construct the four search service instances from the database pool and provider registry.
///
/// `document_uploader` 注入到 indexing-service，供文档直传后建立 Drive 引用。
/// 返回的服务实例以 `Arc` 包装，可在多个 handler 任务间共享。
pub async fn build_services(
    pool: &PgPool,
    provider_registry: &Arc<SearchProviderRegistry>,
    document_uploader: &Arc<dyn DocumentUploadPort>,
) -> anyhow::Result<(
    Arc<QueryService>,
    Arc<IndexingService>,
    Arc<RecommendationService>,
    Arc<PromotionService>,
)> {
    let adapter = Arc::new(SearchRepositoryAdapter::new(pool.clone()));

    let query_service = Arc::new(QueryService::new(
        provider_registry.clone(),
        adapter.clone(),
    ));
    let indexing_service = Arc::new(IndexingService::new(
        provider_registry.clone(),
        adapter.clone(),
        document_uploader.clone(),
    ));
    let recommendation_service = Arc::new(RecommendationService::new(
        provider_registry.clone(),
        adapter.clone(),
    ));
    let promotion_service = Arc::new(PromotionService::new(adapter.clone()));

    tracing::info!("search services constructed with SQLx repository adapter");
    Ok((
        query_service,
        indexing_service,
        recommendation_service,
        promotion_service,
    ))
}
