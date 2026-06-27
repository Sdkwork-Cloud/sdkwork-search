//! SDKWork Search app-api route crate (`WEB_BACKEND_SPEC.md` §4.2).

pub mod error;
pub mod handlers;
pub mod manifest;
pub mod mapper;
pub mod paths;
pub mod routes;
pub mod state;

pub use manifest::ROUTES;
pub use paths::API_PREFIX;
pub use routes::build_app_router;
pub use state::SearchAppState;

/// 构建 app-api 路由器，接收由 standalone-gateway 注入的完整 state。
pub fn gateway_mount(state: SearchAppState) -> axum::Router {
    build_app_router(state)
}

pub fn gateway_route_manifest() -> &'static [sdkwork_web_contract::HttpRoute] {
    manifest::ROUTES
}
