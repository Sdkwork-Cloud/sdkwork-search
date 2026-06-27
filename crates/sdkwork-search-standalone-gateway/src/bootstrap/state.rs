//! Application state assembly: connects the database, builds the provider registry, and constructs services.

use std::sync::Arc;

use sdkwork_drive_storage_local::LocalDriveObjectStore;
use sdkwork_search_indexing_service::ports::DocumentUploadPort;
use sdkwork_search_indexing_service::IndexingService;
use sdkwork_search_promotion_service::PromotionService;
use sdkwork_search_provider_spi::SearchProviderRegistry;
use sdkwork_search_query_service::QueryService;
use sdkwork_search_recommendation_service::RecommendationService;
use sqlx::PgPool;

use crate::bootstrap::config::SearchApiServerConfig;
use crate::bootstrap::database::connect_database_pool;
use crate::bootstrap::document_uploader::DriveDocumentUploader;
use crate::bootstrap::providers::build_provider_registry;
use crate::bootstrap::services::build_services;

/// Runtime state assembled during bootstrap and shared across the HTTP server.
#[derive(Clone)]
pub struct ApplicationState {
    pub database_pool: PgPool,
    pub provider_registry: Arc<SearchProviderRegistry>,
    pub document_uploader: Arc<dyn DocumentUploadPort>,
    pub query_service: Arc<QueryService>,
    pub indexing_service: Arc<IndexingService>,
    pub recommendation_service: Arc<RecommendationService>,
    pub promotion_service: Arc<PromotionService>,
}

/// Build the full `ApplicationState` from the supplied configuration.
pub async fn build_application_state(
    config: &SearchApiServerConfig,
) -> anyhow::Result<ApplicationState> {
    let database_pool = connect_database_pool(&config.database_url).await?;
    let provider_registry = build_provider_registry(&config.provider_configs)?;

    // Drive 文档上传适配器：使用独立的 AnyPool（Drive 仓库依赖）与本地对象存储。
    // AnyPool 采用懒连接，避免在 Drive schema 未就绪时阻断 standalone-gateway 启动。
    sqlx::any::install_default_drivers();
    let drive_pool = sqlx::any::AnyPoolOptions::new()
        .max_connections(5)
        .connect_lazy(&config.database_url)
        .map_err(|err| anyhow::anyhow!("failed to create drive upload pool: {err}"))?;
    let object_store = LocalDriveObjectStore::new(&config.upload_root_dir);
    let document_uploader: Arc<dyn DocumentUploadPort> = Arc::new(DriveDocumentUploader::new(
        drive_pool,
        object_store,
        "sdkwork-search",
    ));

    let (query_service, indexing_service, recommendation_service, promotion_service) =
        build_services(&database_pool, &provider_registry, &document_uploader).await?;

    Ok(ApplicationState {
        database_pool,
        provider_registry,
        document_uploader,
        query_service,
        indexing_service,
        recommendation_service,
        promotion_service,
    })
}
