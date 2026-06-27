//! SQLx repository implementation for search indexing capability.
//! Follows RUST_CODE_SPEC.md repository crate layout.

pub mod db;
pub mod error;
pub mod mapper;
pub mod repository;
pub mod service_adapter;

pub use error::{RepositoryError, RepositoryResult};
pub use repository::{
    CreatePromotionParams, SearchDocumentRepository, SearchIndexRepository,
    SearchPromotionRepository, SearchSuggestionRepository, SearchUserEventRepository,
    UpsertRecentQueryParams,
};
pub use service_adapter::SearchRepositoryAdapter;

/// Migration SQL embedded at compile time.
pub const SEARCH_INDEXING_MIGRATION_SQL: &str =
    include_str!("../migrations/0001_search_storage.sql");
