//! Document indexing models.

use serde::{Deserialize, Serialize};

pub type DocumentId = String;

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct IndexDocument {
    pub index_key: String,
    pub document_id: DocumentId,
    pub source: serde_json::Value,
    #[serde(default)]
    pub title: Option<String>,
    #[serde(default)]
    pub content: Option<String>,
    #[serde(default)]
    pub tags: Vec<String>,
    #[serde(default)]
    pub drive_space_id: Option<String>,
    #[serde(default)]
    pub drive_node_id: Option<String>,
    #[serde(default)]
    pub embedding: Vec<f32>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct IndexDocumentBatch {
    pub index_key: String,
    pub documents: Vec<IndexDocument>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct UpdateDocument {
    pub index_key: String,
    pub document_id: DocumentId,
    pub source: serde_json::Value,
    #[serde(default)]
    pub partial: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct DeleteDocument {
    pub index_key: String,
    pub document_id: DocumentId,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct IndexOperation {
    pub op: IndexOperationKind,
    pub document: IndexDocument,
}

#[derive(Debug, Clone, Copy, Serialize, Deserialize, PartialEq, Eq)]
#[serde(rename_all = "lowercase")]
pub enum IndexOperationKind {
    Insert,
    Update,
    Delete,
}

#[derive(Debug, Clone, Default, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct IndexOperationResult {
    pub success_count: u32,
    pub failure_count: u32,
    pub errors: Vec<IndexOperationError>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct IndexOperationError {
    pub document_id: DocumentId,
    pub message: String,
}
