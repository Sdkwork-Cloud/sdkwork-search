//! Search provider error types.

use thiserror::Error;

pub type SearchProviderResult<T> = Result<T, SearchProviderError>;

#[derive(Debug, Error)]
pub enum SearchProviderError {
    #[error("provider not found: {kind:?}")]
    ProviderNotFound {
        kind: crate::provider::SearchProviderKind,
    },

    #[error("capability not supported: {capability:?} by provider {kind:?}")]
    CapabilityNotSupported {
        capability: crate::provider::SearchProviderCapability,
        kind: crate::provider::SearchProviderKind,
    },

    #[error("index not found: {index_key}")]
    IndexNotFound { index_key: String },

    #[error("document not found: {document_id}")]
    DocumentNotFound { document_id: String },

    #[error("configuration error: {message}")]
    Configuration { message: String },

    #[error("query error: {message}")]
    Query { message: String },

    #[error("indexing error: {message}")]
    Indexing { message: String },

    #[error("backend error: {message}")]
    Backend { message: String },

    #[error("timeout after {timeout_ms}ms")]
    Timeout { timeout_ms: u64 },

    #[error("serialization error: {0}")]
    Serialization(#[from] serde_json::Error),

    #[error("io error: {0}")]
    Io(#[from] std::io::Error),
}
