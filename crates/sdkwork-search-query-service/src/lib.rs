//! SDKWork Search query service.
//!
//! Orchestrates search execution against the provider registry. Follows the
//! `RUST_CODE_SPEC.md` business service crate layout.

pub mod domain;
pub mod error;
pub mod ports;
pub mod service;

pub use error::{QueryServiceError, QueryServiceResult};
pub use service::QueryService;
