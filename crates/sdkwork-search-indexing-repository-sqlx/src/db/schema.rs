//! Table and column name constants for the search indexing schema.
//!
//! Constants are the physical PostgreSQL identifiers. Tenant isolation is enforced
//! at the query level: every query MUST filter by `tenant_id` and
//! `organization_id`.

// --- Table names ---

pub const SEARCH_INDEX_TABLE: &str = "search_index";
pub const SEARCH_DOCUMENT_TABLE: &str = "search_document";
pub const SEARCH_DOCUMENT_PROJECTION_TABLE: &str = "search_document_projection";
pub const SEARCH_QUERY_SUGGESTION_TABLE: &str = "search_query_suggestion";
pub const SEARCH_USER_EVENT_TABLE: &str = "search_user_event";
pub const SEARCH_RECENT_QUERY_TABLE: &str = "search_recent_query";
pub const SEARCH_QUERY_AUDIT_TABLE: &str = "search_query_audit";
pub const SEARCH_INDEX_JOB_TABLE: &str = "search_index_job";
pub const SEARCH_EMBEDDING_JOB_TABLE: &str = "search_embedding_job";

// --- Common column names (shared across tables) ---

pub const COL_ID: &str = "id";
pub const COL_UUID: &str = "uuid";
pub const COL_TENANT_ID: &str = "tenant_id";
pub const COL_ORGANIZATION_ID: &str = "organization_id";
pub const COL_INDEX_KEY: &str = "index_key";
pub const COL_INDEX_ID: &str = "index_id";
pub const COL_DOCUMENT_ID: &str = "document_id";
pub const COL_TITLE: &str = "title";
pub const COL_DESCRIPTION: &str = "description";
pub const COL_STATUS: &str = "status";
pub const COL_DATA_SCOPE: &str = "data_scope";
pub const COL_CONFIG_JSON: &str = "config_json";
pub const COL_PAYLOAD_JSON: &str = "payload_json";
pub const COL_TOKEN_JSON: &str = "token_json";
pub const COL_EMBEDDING_JSON: &str = "embedding_json";
pub const COL_BODY_TEXT: &str = "body_text";
pub const COL_KEYWORD_TEXT: &str = "keyword_text";
pub const COL_SEARCH_VECTOR: &str = "search_vector";
pub const COL_SCOPE: &str = "scope";
pub const COL_CAPABILITY: &str = "capability";
pub const COL_GROUP_KEY: &str = "group_key";
pub const COL_GROUP_TITLE: &str = "group_title";
pub const COL_SOURCE_REF: &str = "source_ref";
pub const COL_VERSION: &str = "version";
pub const COL_CREATED_AT: &str = "created_at";
pub const COL_UPDATED_AT: &str = "updated_at";
pub const COL_DELETED_AT: &str = "deleted_at";
pub const COL_DELETED_BY: &str = "deleted_by";
pub const COL_INDEXED_AT: &str = "indexed_at";

// --- Suggestion specific ---

pub const COL_SUGGESTION_TEXT: &str = "suggestion_text";
pub const COL_SOURCE: &str = "source";
pub const COL_SCORE: &str = "score";

// --- User event specific ---

pub const COL_USER_ID: &str = "user_id";
pub const COL_EVENT_TYPE: &str = "event_type";
pub const COL_SURFACE: &str = "surface";
pub const COL_PLACEMENT: &str = "placement";
pub const COL_Q: &str = "q";
pub const COL_RESULT_POSITION: &str = "result_position";
pub const COL_REQUEST_ID: &str = "request_id";
pub const COL_TRACE_ID: &str = "trace_id";
pub const COL_METADATA_JSON: &str = "metadata_json";
pub const COL_OCCURRED_AT: &str = "occurred_at";

// --- Recent query specific ---

pub const COL_RESULT_COUNT: &str = "result_count";
pub const COL_LAST_USED_AT: &str = "last_used_at";

/// Selectable column list for `search_document`, excluding the generated
/// `search_vector` TSVECTOR column which sqlx cannot decode into a native type.
///
/// Queries that decode into [`super::rows::SearchDocumentRow`] MUST use this list
/// (or a subset) instead of `SELECT *`.
pub const SEARCH_DOCUMENT_SELECT_COLUMNS: &str = "\
id, uuid, tenant_id, organization_id, index_id, index_key, document_id, \
capability, scope, group_key, group_title, source_ref, title, body_text, \
keyword_text, payload_json, token_json, embedding_json, status, data_scope, \
indexed_at, created_at, updated_at, version, deleted_at, deleted_by";
