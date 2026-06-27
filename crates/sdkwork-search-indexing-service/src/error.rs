//! Indexing service error types.

use sdkwork_search_provider_spi::SearchProviderError;
use thiserror::Error;

pub type IndexingServiceResult<T> = Result<T, IndexingServiceError>;

#[derive(Debug, Error)]
pub enum IndexingServiceError {
    #[error("provider error: {0}")]
    Provider(#[from] SearchProviderError),

    #[error("repository error: {0}")]
    Repository(String),

    #[error("configuration error: {0}")]
    Configuration(String),

    #[error("validation error: {0}")]
    Validation(String),

    #[error("document upload error: {0}")]
    Upload(String),
}
