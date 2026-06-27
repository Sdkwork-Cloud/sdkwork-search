//! Process entry point for the SDKWork Search HTTP API server.

use std::net::SocketAddr;

use sdkwork_search_standalone_gateway::bootstrap::{build_application_state, SearchApiServerConfig};
use sdkwork_search_standalone_gateway::listen;
use sdkwork_web_bootstrap::init_tracing_from_env;

#[tokio::main]
async fn main() -> anyhow::Result<()> {
    init_tracing_from_env();

    let config = SearchApiServerConfig::from_env();
    let addr: SocketAddr = config.bind_addr.parse().map_err(|err| {
        anyhow::anyhow!("invalid SEARCH_API_BIND_ADDR {:?}: {err}", config.bind_addr)
    })?;

    let state = build_application_state(&config).await?;

    tracing::info!(bind_addr = %config.bind_addr, "starting sdkwork-search-standalone-gateway");
    listen(addr, state).await?;
    Ok(())
}
