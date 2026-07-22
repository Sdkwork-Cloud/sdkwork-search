//! Authored API assembly bootstrap for sdkwork-search.

use axum::Router;
use sdkwork_routes_search_app_api::SearchAppState;
use sdkwork_routes_search_backend_api::SearchBackendState;

pub struct ApiAssembly {
    pub router: Router,
}

pub fn assemble_api_router(
    app_state: SearchAppState,
    backend_state: SearchBackendState,
) -> ApiAssembly {
    let router = Router::new()
        .merge(sdkwork_routes_search_app_api::gateway_mount(app_state))
        .merge(sdkwork_routes_search_backend_api::gateway_mount(
            backend_state,
        ));
    ApiAssembly { router }
}
