//! In-process service host for standalone/native SDKWork Search usage.
//! No HTTP route mounting - per RUST_CODE_SPEC.md service host contract.

pub mod container;
pub mod runtime;

pub use container::SearchServiceContainer;
pub use runtime::SearchServiceRuntime;
