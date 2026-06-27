//! Search indexing repository implementations.
//!
//! Concrete repository structs backed by `sqlx::PgPool`. They return physical
//! row types from [`crate::db::rows`]. The service crate will define repository
//! ports as traits; this crate will then implement them. For now the structs are
//! concrete to allow the API server to wire persistence.

pub mod document_repository;
pub mod index_repository;
pub mod promotion_repository;
pub mod queries;
pub mod suggestion_repository;
pub mod user_event_repository;

pub use document_repository::{SearchDocumentRepository, UpsertDocumentParams};
pub use index_repository::{
    CreateIndexJobParams, CreateIndexParams, SearchIndexRepository, UpdateIndexParams,
};
pub use promotion_repository::{CreatePromotionParams, SearchPromotionRepository};
pub use suggestion_repository::SearchSuggestionRepository;
pub use user_event_repository::{
    RecordUserEventParams, SearchUserEventRepository, UpsertRecentQueryParams,
};
