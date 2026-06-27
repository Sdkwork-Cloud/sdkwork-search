//! In-memory SearchProvider implementation for tests and small datasets.
//!
//! Follows `WEB_BACKEND_SPEC.md` provider adapter layer and `RUST_CODE_SPEC.md`.

mod provider;

pub use provider::{factory, MemorySearchProvider};
