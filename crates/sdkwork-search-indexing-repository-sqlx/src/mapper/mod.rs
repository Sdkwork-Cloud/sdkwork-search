//! Row-to-domain-model mapping for the search indexing repository.
//!
//! Converts physical row types into SPI domain models exposed by
//! `sdkwork-search-provider-spi`. Mappers are one-directional (row -> model);
//! persistence inputs are accepted as dedicated params structs in the repository
//! layer to avoid coupling physical rows to write contracts.

use sdkwork_search_provider_spi::IndexDocument;
use serde_json::Value;

use crate::db::rows::{SearchDocumentHitRow, SearchDocumentRow, SearchIndexRow};

/// Map a [`SearchIndexRow`] into a serializable snapshot value.
///
/// The index row's `config_json` carries provider-specific configuration; the
/// mapper exposes the full row as JSON so service layers can project only the
/// fields they need.
pub fn index_row_to_config_snapshot(row: &SearchIndexRow) -> Value {
    serde_json::json!({
        "index_key": row.index_key,
        "title": row.title,
        "description": row.description,
        "status": row.status,
        "data_scope": row.data_scope,
        "config_json": row.config_json,
        "version": row.version,
    })
}

/// Map a [`SearchDocumentRow`] into an SPI [`IndexDocument`].
///
/// `payload_json` becomes the document `source`, `body_text` becomes `content`,
/// and `embedding_json` is parsed into a `Vec<f32>` when it contains a JSON
/// array under the `"vector"` key (pgvector storage convention).
pub fn document_row_to_index_document(row: &SearchDocumentRow) -> IndexDocument {
    IndexDocument {
        index_key: row.index_key.clone(),
        document_id: row.document_id.clone(),
        source: row.payload_json.clone(),
        title: Some(row.title.clone()),
        content: row.body_text.clone(),
        tags: Vec::new(),
        drive_space_id: None,
        drive_node_id: None,
        embedding: extract_embedding(&row.embedding_json),
    }
}

/// Map a [`SearchDocumentHitRow`] into an SPI [`IndexDocument`], discarding the
/// relevance `score`. Use the score at the service layer for ranking.
pub fn document_hit_to_index_document(hit: &SearchDocumentHitRow) -> IndexDocument {
    document_row_to_index_document(&hit.document)
}

/// Extract a float embedding vector from a JSONB value.
///
/// Supports two conventions:
/// - A bare JSON array of numbers: `[0.1, 0.2, ...]`
/// - An object with a `"vector"` array: `{"vector": [0.1, 0.2, ...]}`
///
/// Returns an empty vector when no array is present.
fn extract_embedding(embedding_json: &Value) -> Vec<f32> {
    let array = embedding_json
        .as_array()
        .or_else(|| embedding_json.get("vector").and_then(Value::as_array));
    match array {
        Some(values) => values
            .iter()
            .filter_map(|v| v.as_f64().map(|f| f as f32))
            .collect(),
        None => Vec::new(),
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn extracts_bare_array_embedding() {
        let value = serde_json::json!([0.1, 0.2, 0.3]);
        let embedding = extract_embedding(&value);
        assert_eq!(embedding, vec![0.1, 0.2, 0.3]);
    }

    #[test]
    fn extracts_vector_key_embedding() {
        let value = serde_json::json!({"vector": [1.0, 2.0]});
        let embedding = extract_embedding(&value);
        assert_eq!(embedding, vec![1.0, 2.0]);
    }

    #[test]
    fn returns_empty_for_object_embedding() {
        let value = serde_json::json!({});
        assert!(extract_embedding(&value).is_empty());
    }
}
