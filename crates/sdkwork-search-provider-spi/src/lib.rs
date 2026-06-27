//! SDKWork Search provider SPI.
//!
//! Pluggable search engine abstraction following `WEB_BACKEND_SPEC.md` provider adapter layer and
//! `RUST_CODE_SPEC.md` business service crate conventions. Service crates depend on these traits;
//! concrete providers (postgresql, memory, elasticsearch, ...) implement them.
//!
//! Design goals (per user requirement): high cohesion, low coupling, pluggable, high performance,
//! feature-complete. Provider selection is config-driven via `SearchProviderConfig`.

pub mod context;
pub mod document;
pub mod error;
pub mod provider;
pub mod query;
pub mod registry;

pub use context::{SearchProviderContext, SearchProviderContextBuilder};
pub use document::{
    DeleteDocument, DocumentId, IndexDocument, IndexDocumentBatch, IndexOperation,
    IndexOperationResult, UpdateDocument,
};
pub use error::{SearchProviderError, SearchProviderResult};
pub use provider::{SearchProvider, SearchProviderCapability, SearchProviderKind};
pub use query::{
    FacetBucket, HighlightConfig, SearchFacet, SearchHit, SearchQuery, SearchResponse,
    SearchSuggestionQuery, SearchSuggestionResponse, SemanticSearchQuery, SemanticSearchResponse,
    SortClause, SortOrder,
};
pub use registry::{SearchProviderRegistry, SearchProviderRegistryBuilder};
