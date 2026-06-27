//! Recommendation service error types.

use sdkwork_search_provider_spi::SearchProviderError;
use thiserror::Error;

pub type RecommendationServiceResult<T> = Result<T, RecommendationServiceError>;

#[derive(Debug, Error)]
pub enum RecommendationServiceError {
    #[error("provider error: {0}")]
    Provider(#[from] SearchProviderError),

    #[error("repository error: {0}")]
    Repository(String),

    #[error("configuration error: {0}")]
    Configuration(String),

    #[error("validation error: {0}")]
    Validation(String),
}
