//! Search provider trait and capability model.

use crate::{
    document::{DeleteDocument, IndexDocument, IndexDocumentBatch, UpdateDocument},
    error::SearchProviderResult,
    query::{
        SearchQuery, SearchResponse, SearchSuggestionQuery, SearchSuggestionResponse,
        SemanticSearchQuery, SemanticSearchResponse,
    },
};
use serde::{Deserialize, Serialize};

/// Provider kind enum mirrors `SdkworkSearchProviderKind` in TypeScript contracts.
/// New providers MUST be registered through `SearchProviderRegistryBuilder`.
#[derive(Debug, Clone, Copy, PartialEq, Eq, Hash, Serialize, Deserialize)]
#[serde(rename_all = "lowercase")]
pub enum SearchProviderKind {
    Memory,
    Postgresql,
    Elasticsearch,
    Opensearch,
    Meilisearch,
    Typesense,
    Algolia,
    Vector,
    Custom,
}

impl SearchProviderKind {
    pub fn as_str(&self) -> &'static str {
        match self {
            Self::Memory => "memory",
            Self::Postgresql => "postgresql",
            Self::Elasticsearch => "elasticsearch",
            Self::Opensearch => "opensearch",
            Self::Meilisearch => "meilisearch",
            Self::Typesense => "typesense",
            Self::Algolia => "algolia",
            Self::Vector => "vector",
            Self::Custom => "custom",
        }
    }

    pub fn parse(value: &str) -> Option<Self> {
        match value.to_ascii_lowercase().as_str() {
            "memory" => Some(Self::Memory),
            "postgresql" | "postgres" | "pg" => Some(Self::Postgresql),
            "elasticsearch" | "es" => Some(Self::Elasticsearch),
            "opensearch" | "os" => Some(Self::Opensearch),
            "meilisearch" | "meili" => Some(Self::Meilisearch),
            "typesense" => Some(Self::Typesense),
            "algolia" => Some(Self::Algolia),
            "vector" => Some(Self::Vector),
            "custom" => Some(Self::Custom),
            _ => None,
        }
    }
}

/// Mirrors `SdkworkSearchProviderCapability` in TypeScript contracts.
#[derive(Debug, Clone, Copy, PartialEq, Eq, Hash, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub enum SearchProviderCapability {
    FullTextSearch,
    FuzzySearch,
    SemanticSearch,
    VectorSearch,
    FacetedSearch,
    Autocomplete,
    Highlighting,
    Ranking,
    Suggestions,
    Indexing,
    DocumentCrud,
    Synonyms,
    Analytics,
}

/// Provider config descriptor consumed by `SearchProviderRegistryBuilder` and provider factories.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SearchProviderConfig {
    pub kind: SearchProviderKind,
    pub id: String,
    pub priority: u32,
    pub enabled: bool,
    pub connection: serde_json::Value,
    pub options: serde_json::Value,
}

/// The core pluggable search provider trait.
///
/// Implementations live in `sdkwork-search-provider-{kind}` crates and register through
/// `SearchProviderRegistryBuilder`. Service crates depend on this trait, not on concrete
/// implementations, ensuring high cohesion / low coupling.
#[async_trait::async_trait]
pub trait SearchProvider: Send + Sync {
    fn kind(&self) -> SearchProviderKind;
    fn id(&self) -> &str;
    fn capabilities(&self) -> &[SearchProviderCapability];
    fn supports(&self, capability: SearchProviderCapability) -> bool {
        self.capabilities().contains(&capability)
    }

    async fn health(&self) -> SearchProviderResult<bool>;

    async fn search(
        &self,
        ctx: &crate::context::SearchProviderContext,
        query: &SearchQuery,
    ) -> SearchProviderResult<SearchResponse>;

    async fn suggest(
        &self,
        ctx: &crate::context::SearchProviderContext,
        query: &SearchSuggestionQuery,
    ) -> SearchProviderResult<SearchSuggestionResponse>;

    async fn semantic_search(
        &self,
        ctx: &crate::context::SearchProviderContext,
        query: &SemanticSearchQuery,
    ) -> SearchProviderResult<SemanticSearchResponse>;

    async fn index_document(
        &self,
        ctx: &crate::context::SearchProviderContext,
        doc: &IndexDocument,
    ) -> SearchProviderResult<()>;

    async fn index_batch(
        &self,
        ctx: &crate::context::SearchProviderContext,
        batch: &IndexDocumentBatch,
    ) -> SearchProviderResult<crate::document::IndexOperationResult>;

    async fn update_document(
        &self,
        ctx: &crate::context::SearchProviderContext,
        doc: &UpdateDocument,
    ) -> SearchProviderResult<()>;

    async fn delete_document(
        &self,
        ctx: &crate::context::SearchProviderContext,
        doc: &DeleteDocument,
    ) -> SearchProviderResult<()>;

    async fn create_index(
        &self,
        ctx: &crate::context::SearchProviderContext,
        index_key: &str,
        schema: &serde_json::Value,
    ) -> SearchProviderResult<()>;

    async fn drop_index(
        &self,
        ctx: &crate::context::SearchProviderContext,
        index_key: &str,
    ) -> SearchProviderResult<()>;
}
