//! HTTP listener entry point.
//!
//! Delegates graceful shutdown and lifecycle hooks to `sdkwork_web_bootstrap::serve`.

use std::net::SocketAddr;

use axum::Router;

use crate::bootstrap::routers::build_application_router;
use crate::bootstrap::ApplicationState;

/// Build the application router from `state` and serve it on `addr` until shutdown.
pub async fn listen(addr: SocketAddr, state: ApplicationState) -> std::io::Result<()> {
    let router: Router = build_application_router(state);
    sdkwork_web_bootstrap::serve(router, addr).await
}
