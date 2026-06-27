//! Indexing service domain models.

use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};

/// Status of an indexing job.
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum IndexJobStatus {
    Pending,
    Running,
    Completed,
    Failed,
}

/// Represents an indexing job tracked by the indexing repository.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct IndexJob {
    pub job_id: String,
    pub index_key: String,
    pub status: IndexJobStatus,
    pub document_count: u32,
    pub success_count: u32,
    pub failure_count: u32,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

/// Result of an indexing operation.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct IndexingResult {
    pub job_id: String,
    pub success: bool,
    pub success_count: u32,
    pub failure_count: u32,
    pub message: Option<String>,
}

/// 文档摘要（列表/单文档查询返回）。
///
/// 承载文档的元数据与可见字段，不包含全文/向量等大字段，用于列表与单文档
/// 查询场景，遵循 `RUST_CODE_SPEC.md` 领域模型与行类型分离的约定。
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DocumentSummary {
    pub document_id: String,
    pub index_key: String,
    pub title: String,
    pub payload_json: serde_json::Value,
    pub status: i32,
    pub updated_at: Option<String>,
}

/// 索引统计信息。
///
/// 汇总指定索引下的文档总数、活跃文档数与最后更新时间，用于运营与监控。
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct IndexStats {
    pub index_key: String,
    pub document_count: u64,
    pub active_document_count: u64,
    pub last_updated: Option<String>,
}
