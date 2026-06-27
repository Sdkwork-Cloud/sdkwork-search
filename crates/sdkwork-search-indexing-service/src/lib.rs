//! SDKWork Search indexing service.
//!
//! Orchestrates document indexing and index lifecycle against the provider registry.
//! Follows the `RUST_CODE_SPEC.md` business service crate layout.

pub mod domain;
pub mod error;
pub mod ports;
pub mod service;

pub use error::{IndexingServiceError, IndexingServiceResult};
pub use service::IndexingService;
