//! Promotion service error types.

use sdkwork_search_provider_spi::SearchProviderError;
use thiserror::Error;

pub type PromotionServiceResult<T> = Result<T, PromotionServiceError>;

#[derive(Debug, Error)]
pub enum PromotionServiceError {
    #[error("provider error: {0}")]
    Provider(#[from] SearchProviderError),

    #[error("repository error: {0}")]
    Repository(String),

    #[error("configuration error: {0}")]
    Configuration(String),

    #[error("validation error: {0}")]
    Validation(String),
}
