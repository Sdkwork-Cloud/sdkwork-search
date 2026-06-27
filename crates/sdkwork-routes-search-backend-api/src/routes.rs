use crate::handlers;
use crate::paths;
use crate::state::SearchBackendState;
use axum::routing::{delete, get, patch, post};
use axum::Router;

pub fn build_backend_router(state: SearchBackendState) -> Router {
    Router::new()
        .route(
            paths::indexes::COLLECTION,
            get(handlers::list_indexes).post(handlers::create_index),
        )
        .route(
            paths::indexes::BY_KEY,
            delete(handlers::delete_index).patch(handlers::update_index),
        )
        .route(paths::indexes::REBUILD, post(handlers::rebuild_index))
        .route(paths::providers::COLLECTION, get(handlers::list_providers))
        .route(paths::providers::HEALTH, get(handlers::provider_health))
        .route(paths::documents::COLLECTION, get(handlers::list_documents))
        .route(paths::documents::BY_ID, delete(handlers::delete_document))
        .route(paths::documents::INDEX, post(handlers::index_document))
        .route(
            paths::documents::BATCH,
            post(handlers::batch_index_documents),
        )
        .route(
            paths::recommendations::STRATEGIES,
            get(handlers::list_recommendation_strategies),
        )
        .route(
            paths::promotions::COLLECTION,
            get(handlers::list_promotions).post(handlers::create_promotion),
        )
        .route(
            paths::promotions::BY_ID,
            patch(handlers::update_promotion).delete(handlers::delete_promotion),
        )
        .route(paths::audit::PATH, get(handlers::list_audit))
        .with_state(state)
}
