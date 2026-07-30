//! Server configuration loaded from environment variables.

use sdkwork_search_provider_spi::provider::{SearchProviderConfig, SearchProviderKind};
use serde_json::json;

/// Configuration for the SDKWork Search HTTP API server process.
#[derive(Debug, Clone)]
pub struct SearchApiServerConfig {
    /// Socket address to bind the HTTP listener, e.g. `0.0.0.0:8080`.
    pub bind_addr: String,
    /// PostgreSQL connection URL.
    pub database_url: String,
    /// Provider configuration descriptors consumed by `SearchProviderRegistryBuilder`.
    pub provider_configs: Vec<SearchProviderConfig>,
    /// Drive 文档上传本地对象存储根目录（Phase 5 直传落地目录）。
    pub upload_root_dir: String,
}

impl SearchApiServerConfig {
    /// Load configuration from environment variables with safe development defaults.
    ///
    /// - `SEARCH_API_BIND_ADDR` (default `0.0.0.0:8080`)
    /// - `SDKWORK_DATABASE_*` (canonical workspace PostgreSQL profile)
    /// - `SEARCH_UPLOAD_ROOT_DIR` (default `var/search-uploads`)
    pub fn from_env() -> anyhow::Result<Self> {
        let bind_addr =
            std::env::var("SEARCH_API_BIND_ADDR").unwrap_or_else(|_| "0.0.0.0:8080".to_owned());
        let database =
            sdkwork_database_config::DatabaseConfig::from_env("search").map_err(|error| {
                anyhow::anyhow!("invalid SDKWORK_DATABASE_* configuration: {error}")
            })?;
        if database.engine != sdkwork_database_config::DatabaseEngine::Postgres {
            anyhow::bail!(
                "search standalone gateway authoritative persistence requires PostgreSQL"
            );
        }
        let database_url = database.url;
        let upload_root_dir = std::env::var("SEARCH_UPLOAD_ROOT_DIR")
            .unwrap_or_else(|_| "var/search-uploads".to_owned());
        let provider_configs = vec![SearchProviderConfig {
            kind: SearchProviderKind::Memory,
            id: "memory-default".to_owned(),
            priority: 0,
            enabled: true,
            connection: json!({}),
            options: json!({}),
        }];
        Ok(Self {
            bind_addr,
            database_url,
            provider_configs,
            upload_root_dir,
        })
    }
}
