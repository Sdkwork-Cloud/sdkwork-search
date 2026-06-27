//! In-memory search provider implementation.

use sdkwork_search_provider_spi::{
    context::SearchProviderContext,
    document::{
        DeleteDocument, IndexDocument, IndexDocumentBatch, IndexOperationResult, UpdateDocument,
    },
    error::{SearchProviderError, SearchProviderResult},
    provider::{
        SearchProvider, SearchProviderCapability, SearchProviderConfig, SearchProviderKind,
    },
    query::{
        FacetBucket, SearchHit, SearchQuery, SearchResponse, SearchSuggestion,
        SearchSuggestionQuery, SearchSuggestionResponse, SemanticSearchHit, SemanticSearchQuery,
        SemanticSearchResponse,
    },
    registry::SearchProviderFactory,
};
use std::collections::HashMap;
use std::sync::{Arc, RwLock};

const CAPABILITIES: &[SearchProviderCapability] = &[
    SearchProviderCapability::FullTextSearch,
    SearchProviderCapability::FuzzySearch,
    SearchProviderCapability::SemanticSearch,
    SearchProviderCapability::VectorSearch,
    SearchProviderCapability::FacetedSearch,
    SearchProviderCapability::Autocomplete,
    SearchProviderCapability::Highlighting,
    SearchProviderCapability::Ranking,
    SearchProviderCapability::Suggestions,
    SearchProviderCapability::Indexing,
    SearchProviderCapability::DocumentCrud,
];

/// In-memory index store: index_key -> (document_id -> document).
type IndexStore = HashMap<String, HashMap<String, IndexDocument>>;

pub struct MemorySearchProvider {
    id: String,
    stores: RwLock<IndexStore>,
}

impl MemorySearchProvider {
    pub fn new(id: impl Into<String>) -> Self {
        Self {
            id: id.into(),
            stores: RwLock::new(HashMap::new()),
        }
    }

    fn score_document(query_text: &str, doc: &IndexDocument) -> f64 {
        let q = query_text.to_ascii_lowercase();
        let mut score: f64 = 0.0;
        if let Some(title) = &doc.title {
            let t = title.to_ascii_lowercase();
            if t.contains(&q) {
                score += 5.0;
            }
            if t == q {
                score += 3.0;
            }
        }
        if let Some(content) = &doc.content {
            let c = content.to_ascii_lowercase();
            if c.contains(&q) {
                score += 1.0
                    + q.split_whitespace()
                        .filter(|w| !w.is_empty() && c.contains(*w))
                        .count() as f64
                        * 0.2;
            }
        }
        for tag in &doc.tags {
            if tag.to_ascii_lowercase().contains(&q) {
                score += 0.5;
            }
        }
        score
    }

    fn cosine_similarity(a: &[f32], b: &[f32]) -> f32 {
        if a.len() != b.len() || a.is_empty() {
            return 0.0;
        }
        let dot: f32 = a.iter().zip(b.iter()).map(|(x, y)| x * y).sum();
        let norm_a: f32 = a.iter().map(|x| x * x).sum::<f32>().sqrt();
        let norm_b: f32 = b.iter().map(|x| x * x).sum::<f32>().sqrt();
        if norm_a == 0.0 || norm_b == 0.0 {
            return 0.0;
        }
        dot / (norm_a * norm_b)
    }
}

#[async_trait::async_trait]
impl SearchProvider for MemorySearchProvider {
    fn kind(&self) -> SearchProviderKind {
        SearchProviderKind::Memory
    }

    fn id(&self) -> &str {
        &self.id
    }

    fn capabilities(&self) -> &[SearchProviderCapability] {
        CAPABILITIES
    }

    async fn health(&self) -> SearchProviderResult<bool> {
        Ok(true)
    }

    async fn search(
        &self,
        _ctx: &SearchProviderContext,
        query: &SearchQuery,
    ) -> SearchProviderResult<SearchResponse> {
        let start = std::time::Instant::now();
        let stores = self
            .stores
            .read()
            .map_err(|e| SearchProviderError::Backend {
                message: format!("lock poisoned: {e}"),
            })?;

        let index = stores.get(&query.index_key);
        let mut hits: Vec<SearchHit> = Vec::new();
        let mut facets: HashMap<String, Vec<FacetBucket>> = HashMap::new();

        if let Some(docs) = index {
            for doc in docs.values() {
                let score = Self::score_document(&query.query_text, doc);
                if score <= 0.0 {
                    continue;
                }
                let highlight = if query.highlight.is_some() {
                    let mut hl = HashMap::new();
                    if let Some(title) = &doc.title {
                        if title
                            .to_ascii_lowercase()
                            .contains(&query.query_text.to_ascii_lowercase())
                        {
                            hl.insert("title".to_string(), vec![format!("<em>{}</em>", title)]);
                        }
                    }
                    hl
                } else {
                    HashMap::new()
                };

                for field in &query.facets {
                    if let Some(val) = doc.source.get(field).and_then(|v| v.as_str()) {
                        facets.entry(field.clone()).or_default().push(FacetBucket {
                            value: val.to_string(),
                            count: 1,
                        });
                    }
                }

                hits.push(SearchHit {
                    document_id: doc.document_id.clone(),
                    score,
                    source: doc.source.clone(),
                    highlight,
                    index_key: Some(doc.index_key.clone()),
                });
            }
        }

        hits.sort_by(|a, b| {
            b.score
                .partial_cmp(&a.score)
                .unwrap_or(std::cmp::Ordering::Equal)
        });
        let total = hits.len() as u64;
        let max_score = hits.first().map(|h| h.score);

        let page = query.page.max(1) as usize;
        let page_size = query.page_size.max(1) as usize;
        let start_idx = (page - 1) * page_size;
        let paged: Vec<SearchHit> = hits.into_iter().skip(start_idx).take(page_size).collect();

        // merge facet counts
        for buckets in facets.values_mut() {
            buckets.sort_by(|a, b| b.count.cmp(&a.count));
        }

        Ok(SearchResponse {
            total,
            hits: paged,
            facets,
            took_ms: start.elapsed().as_millis() as u64,
            max_score,
            request_id: _ctx.request_id.clone(),
        })
    }

    async fn suggest(
        &self,
        _ctx: &SearchProviderContext,
        query: &SearchSuggestionQuery,
    ) -> SearchProviderResult<SearchSuggestionResponse> {
        let start = std::time::Instant::now();
        let stores = self
            .stores
            .read()
            .map_err(|e| SearchProviderError::Backend {
                message: format!("lock poisoned: {e}"),
            })?;

        let prefix = query.prefix.to_ascii_lowercase();
        let mut suggestions: Vec<SearchSuggestion> = Vec::new();

        if let Some(docs) = stores.get(&query.index_key) {
            for doc in docs.values() {
                if let Some(title) = &doc.title {
                    if title.to_ascii_lowercase().starts_with(&prefix) {
                        suggestions.push(SearchSuggestion {
                            text: title.clone(),
                            score: 1.0,
                            payload: Some(doc.source.clone()),
                        });
                    }
                }
            }
        }

        suggestions.truncate(query.limit.max(1) as usize);
        Ok(SearchSuggestionResponse {
            suggestions,
            took_ms: start.elapsed().as_millis() as u64,
        })
    }

    async fn semantic_search(
        &self,
        _ctx: &SearchProviderContext,
        query: &SemanticSearchQuery,
    ) -> SearchProviderResult<SemanticSearchResponse> {
        let start = std::time::Instant::now();
        let stores = self
            .stores
            .read()
            .map_err(|e| SearchProviderError::Backend {
                message: format!("lock poisoned: {e}"),
            })?;

        let mut hits: Vec<SemanticSearchHit> = Vec::new();
        if let Some(docs) = stores.get(&query.index_key) {
            for doc in docs.values() {
                if doc.embedding.is_empty() || query.query_embedding.is_empty() {
                    continue;
                }
                let score = Self::cosine_similarity(&query.query_embedding, &doc.embedding);
                if let Some(min) = query.min_score {
                    if score < min {
                        continue;
                    }
                }
                hits.push(SemanticSearchHit {
                    document_id: doc.document_id.clone(),
                    score,
                    source: doc.source.clone(),
                });
            }
        }

        hits.sort_by(|a, b| {
            b.score
                .partial_cmp(&a.score)
                .unwrap_or(std::cmp::Ordering::Equal)
        });
        let top_k = query.top_k.max(1) as usize;
        hits.truncate(top_k);

        Ok(SemanticSearchResponse {
            hits,
            took_ms: start.elapsed().as_millis() as u64,
        })
    }

    async fn index_document(
        &self,
        _ctx: &SearchProviderContext,
        doc: &IndexDocument,
    ) -> SearchProviderResult<()> {
        let mut stores = self
            .stores
            .write()
            .map_err(|e| SearchProviderError::Backend {
                message: format!("lock poisoned: {e}"),
            })?;
        let index = stores.entry(doc.index_key.clone()).or_default();
        index.insert(doc.document_id.clone(), doc.clone());
        Ok(())
    }

    async fn index_batch(
        &self,
        ctx: &SearchProviderContext,
        batch: &IndexDocumentBatch,
    ) -> SearchProviderResult<IndexOperationResult> {
        let mut success = 0u32;
        let mut failures = 0u32;
        let mut errors = Vec::new();
        for doc in &batch.documents {
            match self.index_document(ctx, doc).await {
                Ok(()) => success += 1,
                Err(e) => {
                    failures += 1;
                    errors.push(sdkwork_search_provider_spi::document::IndexOperationError {
                        document_id: doc.document_id.clone(),
                        message: e.to_string(),
                    });
                }
            }
        }
        Ok(IndexOperationResult {
            success_count: success,
            failure_count: failures,
            errors,
        })
    }

    async fn update_document(
        &self,
        _ctx: &SearchProviderContext,
        doc: &UpdateDocument,
    ) -> SearchProviderResult<()> {
        let mut stores = self
            .stores
            .write()
            .map_err(|e| SearchProviderError::Backend {
                message: format!("lock poisoned: {e}"),
            })?;
        let index =
            stores
                .get_mut(&doc.index_key)
                .ok_or_else(|| SearchProviderError::IndexNotFound {
                    index_key: doc.index_key.clone(),
                })?;
        let existing = index.get_mut(&doc.document_id).ok_or_else(|| {
            SearchProviderError::DocumentNotFound {
                document_id: doc.document_id.clone(),
            }
        })?;
        if doc.partial {
            if let serde_json::Value::Object(ref mut target) = existing.source {
                if let serde_json::Value::Object(ref src) = doc.source {
                    for (k, v) in src {
                        target.insert(k.clone(), v.clone());
                    }
                }
            } else {
                existing.source = doc.source.clone();
            }
        } else {
            existing.source = doc.source.clone();
        }
        Ok(())
    }

    async fn delete_document(
        &self,
        _ctx: &SearchProviderContext,
        doc: &DeleteDocument,
    ) -> SearchProviderResult<()> {
        let mut stores = self
            .stores
            .write()
            .map_err(|e| SearchProviderError::Backend {
                message: format!("lock poisoned: {e}"),
            })?;
        if let Some(index) = stores.get_mut(&doc.index_key) {
            index.remove(&doc.document_id);
        }
        Ok(())
    }

    async fn create_index(
        &self,
        _ctx: &SearchProviderContext,
        index_key: &str,
        _schema: &serde_json::Value,
    ) -> SearchProviderResult<()> {
        let mut stores = self
            .stores
            .write()
            .map_err(|e| SearchProviderError::Backend {
                message: format!("lock poisoned: {e}"),
            })?;
        stores.entry(index_key.to_string()).or_default();
        Ok(())
    }

    async fn drop_index(
        &self,
        _ctx: &SearchProviderContext,
        index_key: &str,
    ) -> SearchProviderResult<()> {
        let mut stores = self
            .stores
            .write()
            .map_err(|e| SearchProviderError::Backend {
                message: format!("lock poisoned: {e}"),
            })?;
        stores.remove(index_key);
        Ok(())
    }
}

/// Factory function for registry registration.
pub fn factory() -> SearchProviderFactory {
    Arc::new(|cfg: &SearchProviderConfig| {
        Ok(Arc::new(MemorySearchProvider::new(&cfg.id)) as Arc<dyn SearchProvider>)
    })
}

#[cfg(test)]
mod tests {
    use super::*;
    use sdkwork_search_provider_spi::context::SearchProviderContext;

    fn ctx() -> SearchProviderContext {
        SearchProviderContext::default()
    }

    #[tokio::test]
    async fn search_returns_hits() {
        let provider = MemorySearchProvider::new("test");
        let doc = IndexDocument {
            index_key: "idx".into(),
            document_id: "d1".into(),
            source: serde_json::json!({"title": "Rust async guide"}),
            title: Some("Rust async guide".into()),
            content: Some("learn async rust".into()),
            tags: vec![],
            drive_space_id: None,
            drive_node_id: None,
            embedding: vec![],
        };
        provider.index_document(&ctx(), &doc).await.unwrap();

        let query = SearchQuery {
            tenant_id: 0,
            organization_id: 0,
            index_key: "idx".into(),
            query_text: "rust".into(),
            filters: HashMap::new(),
            facets: vec![],
            page: 1,
            page_size: 10,
            sort: vec![],
            highlight: None,
            min_score: None,
            timeout_ms: None,
        };
        let resp = provider.search(&ctx(), &query).await.unwrap();
        assert_eq!(resp.total, 1);
        assert_eq!(resp.hits[0].document_id, "d1");
    }
}
