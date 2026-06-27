//! Gateway assembly for sdkwork-search.
//! Application bootstrap lives in `bootstrap.rs`; route inventory is in `assembly-manifest.json`.

mod bootstrap;
mod generated;

pub use bootstrap::{assemble_application_router, ApplicationAssembly};
pub use sdkwork_routes_search_app_api::SearchAppState;
pub use sdkwork_routes_search_backend_api::SearchBackendState;

pub fn assembly_route_count() -> usize {
    generated::ROUTE_CRATE_COUNT
}

/// Returns the ordered list of route crate package names assembled by this gateway.
pub fn assembly_route_packages() -> &'static [&'static str] {
    generated::ROUTE_CRATE_PACKAGES
}
