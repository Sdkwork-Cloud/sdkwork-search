//! HTTP API server process for SDKWork Search.
//! Assembles the 18-stage WebCallInterceptorChain through sdkwork-web-bootstrap per WEB_FRAMEWORK_SPEC.md.

pub mod bootstrap;
pub mod health;
pub mod preflight;
pub mod server;

pub use bootstrap::ApplicationState;
pub use server::listen;
