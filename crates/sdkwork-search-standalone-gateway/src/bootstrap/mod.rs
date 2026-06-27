//! Application bootstrap: config, state, database, providers, services, and router assembly.

pub mod config;
pub mod database;
pub mod document_uploader;
pub mod providers;
pub mod routers;
pub mod services;
pub mod state;

pub use config::SearchApiServerConfig;
pub use document_uploader::DriveDocumentUploader;
pub use state::{build_application_state, ApplicationState};
