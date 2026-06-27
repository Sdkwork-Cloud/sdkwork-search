//! SDKWork Search recommendation service.
//!
//! Orchestrates strategy-based recommendations using the provider registry and user event
//! history. Follows the `RUST_CODE_SPEC.md` business service crate layout.

pub mod domain;
pub mod error;
pub mod ports;
pub mod service;

pub use error::{RecommendationServiceError, RecommendationServiceResult};
pub use service::RecommendationService;
