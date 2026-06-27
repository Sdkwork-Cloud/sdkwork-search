//! Indexing service ports.

pub mod document_upload;
pub mod repository;

pub use document_upload::{DocumentUploadPort, UploadDocumentRequest, UploadedDocument};
pub use repository::IndexingRepositoryPort;
