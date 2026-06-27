//! Query service domain models and DTOs.

use chrono::{DateTime, Utc};
use sdkwork_search_provider_spi::{SearchQuery, SearchResponse};
use serde::{Deserialize, Serialize};

/// Wraps a successful search execution with audit metadata.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct QueryExecutionResult {
    pub response: SearchResponse,
    pub executed_at: DateTime<Utc>,
}

/// Inbound query request DTO wrapping the provider `SearchQuery`.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct QueryRequestDto {
    pub query: SearchQuery,
    pub requested_at: DateTime<Utc>,
}
