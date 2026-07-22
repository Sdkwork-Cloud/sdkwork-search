//! SDKWork Search database pool bootstrap via `sdkwork-database`.

use sdkwork_database_config::DatabaseConfig;
use sdkwork_database_sqlx::{create_pool_from_config, DatabasePool, PoolError};

pub use sdkwork_search_database_host::{
    bootstrap_search_database, bootstrap_search_database_from_env, SearchDatabaseHost,
};

pub type SearchDatabasePool = DatabasePool;

const SEARCH_POOL_MAX_CONNECTIONS: u32 = 5;

pub async fn connect_search_database_pool_from_env() -> Result<SearchDatabasePool, PoolError> {
    let config = DatabaseConfig::from_env("SEARCH")?;
    create_pool_from_config(config).await
}

pub async fn connect_search_database_pool_from_url(
    database_url: &str,
) -> Result<SearchDatabasePool, PoolError> {
    let normalized = database_url.trim();
    let engine =
        sdkwork_database_config::DatabaseEngine::from_url(normalized).ok_or_else(|| {
            PoolError::InvalidUrl(format!("unsupported search database url: {normalized}"))
        })?;
    create_pool_from_config(DatabaseConfig {
        engine,
        url: normalized.to_string(),
        max_connections: SEARCH_POOL_MAX_CONNECTIONS,
        ..DatabaseConfig::default()
    })
    .await
}

pub async fn connect_and_bootstrap_search_database_from_env() -> Result<SearchDatabaseHost, String>
{
    let pool = connect_search_database_pool_from_env()
        .await
        .map_err(|error| error.to_string())?;
    bootstrap_search_database(pool).await
}

pub async fn connect_and_bootstrap_search_database_from_url(
    database_url: &str,
) -> Result<SearchDatabaseHost, String> {
    let pool = connect_search_database_pool_from_url(database_url)
        .await
        .map_err(|error| error.to_string())?;
    bootstrap_search_database(pool).await
}
