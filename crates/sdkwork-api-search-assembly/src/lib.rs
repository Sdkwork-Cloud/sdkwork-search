//! API assembly for sdkwork-search.
//! Application bootstrap lives in `bootstrap.rs`; route inventory is in `assembly-manifest.json`.

mod bootstrap;
mod generated;

pub use bootstrap::{assemble_api_router, ApiAssembly};
pub use sdkwork_routes_search_app_api::SearchAppState;
pub use sdkwork_routes_search_backend_api::SearchBackendState;

pub fn assembly_route_count() -> usize {
    generated::ROUTE_CRATE_COUNT
}
