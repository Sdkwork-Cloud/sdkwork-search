//! Database row types for the search indexing schema.
//!
//! Row types map physical PostgreSQL columns via `sqlx::FromRow`. They are NOT
//! domain models and are not exposed as API DTOs. Field names match column names
//! so sqlx can decode by position/name.

use chrono::{DateTime, Utc};
use serde_json::Value;
use sqlx::FromRow;

/// Row for the `search_index` table.
#[derive(Debug, Clone, FromRow)]
pub struct SearchIndexRow {
    pub id: i64,
    pub uuid: String,
    pub tenant_id: i64,
    pub organization_id: i64,
    pub index_key: String,
    pub title: String,
    pub description: Option<String>,
    pub status: i32,
    pub data_scope: i32,
    pub config_json: Value,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
    pub version: i64,
    pub deleted_at: Option<DateTime<Utc>>,
    pub deleted_by: Option<i64>,
}

/// Row for the `search_index_job` table.
///
/// 跟踪索引重建等异步任务的状态。`status` 为整数编码：
/// 0=pending、1=running、2=completed、3=failed。
#[derive(Debug, Clone, FromRow)]
pub struct SearchIndexJobRow {
    pub id: i64,
    pub uuid: String,
    pub tenant_id: i64,
    pub organization_id: i64,
    pub index_key: String,
    pub job_type: String,
    pub status: i32,
    pub payload_json: Value,
    pub scheduled_at: DateTime<Utc>,
    pub started_at: Option<DateTime<Utc>>,
    pub finished_at: Option<DateTime<Utc>>,
    pub error_summary: Option<String>,
    pub retry_count: i32,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
    pub version: i64,
}

/// Row for the `search_document` table.
///
/// Excludes the generated `search_vector` TSVECTOR column; queries must select
/// using [`super::schema::SEARCH_DOCUMENT_SELECT_COLUMNS`].
#[derive(Debug, Clone, FromRow)]
pub struct SearchDocumentRow {
    pub id: i64,
    pub uuid: String,
    pub tenant_id: i64,
    pub organization_id: i64,
    pub index_id: i64,
    pub index_key: String,
    pub document_id: String,
    pub capability: Option<String>,
    pub scope: String,
    pub group_key: Option<String>,
    pub group_title: Option<String>,
    pub source_ref: Option<String>,
    pub title: String,
    pub body_text: Option<String>,
    pub keyword_text: Option<String>,
    pub payload_json: Value,
    pub token_json: Value,
    pub embedding_json: Value,
    pub status: i32,
    pub data_scope: i32,
    pub indexed_at: DateTime<Utc>,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
    pub version: i64,
    pub deleted_at: Option<DateTime<Utc>>,
    pub deleted_by: Option<i64>,
}

/// Row for the `search_query_suggestion` table.
#[derive(Debug, Clone, FromRow)]
pub struct SearchSuggestionRow {
    pub id: i64,
    pub uuid: String,
    pub tenant_id: i64,
    pub organization_id: i64,
    pub index_key: String,
    pub suggestion_text: String,
    pub source: String,
    pub score: i32,
    pub status: i32,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
    pub version: i64,
}

/// Row for the `search_user_event` table.
#[derive(Debug, Clone, FromRow)]
pub struct SearchUserEventRow {
    pub id: i64,
    pub uuid: String,
    pub tenant_id: i64,
    pub organization_id: i64,
    pub user_id: i64,
    pub event_type: String,
    pub surface: String,
    pub index_key: Option<String>,
    pub document_id: Option<String>,
    pub placement: Option<String>,
    pub q: Option<String>,
    pub result_position: Option<i32>,
    pub request_id: Option<String>,
    pub metadata_json: Value,
    pub occurred_at: DateTime<Utc>,
    pub created_at: DateTime<Utc>,
}

/// Row for the `search_recent_query` table.
#[derive(Debug, Clone, FromRow)]
pub struct SearchRecentQueryRow {
    pub id: i64,
    pub uuid: String,
    pub tenant_id: i64,
    pub organization_id: i64,
    pub user_id: i64,
    pub index_key: String,
    pub q: String,
    pub result_count: i32,
    pub last_used_at: DateTime<Utc>,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

/// Aggregate result row for fulltext/fuzzy/semantic search, carrying a relevance
/// score alongside the document row.
#[derive(Debug, Clone, FromRow)]
pub struct SearchDocumentHitRow {
    #[sqlx(flatten)]
    pub document: SearchDocumentRow,
    pub score: f64,
}

/// Row for the `search_promotion` table.
#[derive(Debug, Clone, FromRow)]
pub struct SearchPromotionRow {
    pub id: i64,
    pub uuid: String,
    pub tenant_id: i64,
    pub organization_id: i64,
    pub promotion_key: String,
    pub placement: String,
    pub index_key: String,
    pub document_id: String,
    pub priority: i32,
    pub rule_json: Value,
    pub status: i32,
    pub active_from: Option<DateTime<Utc>>,
    pub active_until: Option<DateTime<Utc>>,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
    pub version: i64,
    pub deleted_at: Option<DateTime<Utc>>,
    pub deleted_by: Option<i64>,
}

/// 聚合行：基于 `search_user_event` 统计的热门文档（document_id + 事件计数）。
#[derive(Debug, Clone, FromRow)]
pub struct SearchTrendingRow {
    pub document_id: String,
    pub event_count: i64,
}

/// 聚合行：item-based 协同过滤的相似文档（document_id + 共同用户数）。
#[derive(Debug, Clone, FromRow)]
pub struct SearchSimilarDocumentRow {
    pub document_id: String,
    pub similarity_score: i64,
}
