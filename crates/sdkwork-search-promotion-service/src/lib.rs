//! SDKWork Search promotion service.
//!
//! Delivers promoted search results and tracks promotion clicks. Follows the
//! `RUST_CODE_SPEC.md` business service crate layout.

pub mod domain;
pub mod error;
pub mod ports;
pub mod service;

pub use error::{PromotionServiceError, PromotionServiceResult};
pub use service::PromotionService;
