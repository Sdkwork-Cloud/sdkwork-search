//! Router construction for search app-api (`WEB_BACKEND_SPEC.md` §4.2).

use crate::handlers;
use crate::paths;
use crate::state::SearchAppState;
use axum::routing::{get, post};
use axum::Router;

/// Build the search app-api [`Router`] with all 8 routes mounted under the canonical prefix.
pub fn build_app_router(state: SearchAppState) -> Router {
    Router::new()
        .route(paths::queries::PATH, post(handlers::create_search_query))
        .route(paths::indexes::PATH, get(handlers::list_search_indexes))
        .route(
            paths::suggestions::PATH,
            get(handlers::list_search_suggestions),
        )
        .route(
            paths::recommendations::PATH,
            post(handlers::create_search_recommendation),
        )
        .route(
            paths::promotions::PATH,
            post(handlers::create_search_promotion_delivery),
        )
        .route(
            paths::events::PATH,
            post(handlers::create_search_user_event),
        )
        .route(
            paths::recent_queries::PATH,
            get(handlers::list_search_recent_queries),
        )
        .route(
            paths::semantic_queries::PATH,
            post(handlers::create_search_semantic_query),
        )
        .with_state(state)
}
