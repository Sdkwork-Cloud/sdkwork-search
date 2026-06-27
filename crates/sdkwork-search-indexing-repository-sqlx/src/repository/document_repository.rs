//! `SearchDocumentRepository` - SQLx repository for the `search_document` aggregate.
//!
//! Supports upsert, get, soft-delete, paginated listing, and fulltext/fuzzy/
//! semantic search backed by PostgreSQL `tsvector`, `pg_trgm`, and `pgvector`.

use sqlx::PgPool;
use uuid::Uuid;

use crate::db::rows::{SearchDocumentHitRow, SearchDocumentRow};
use crate::error::RepositoryResult;
use crate::repository::queries;

/// Inputs for upserting a search document.
#[derive(Debug, Clone)]
pub struct UpsertDocumentParams {
    pub id: i64,
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
    pub payload_json: serde_json::Value,
    pub token_json: serde_json::Value,
    pub embedding_json: serde_json::Value,
    pub status: i32,
    pub data_scope: i32,
}

/// SQLx repository for the `search_document` table.
pub struct SearchDocumentRepository {
    pool: PgPool,
}

impl SearchDocumentRepository {
    pub fn new(pool: PgPool) -> Self {
        Self { pool }
    }

    /// Inserts or updates a document on `(tenant_id, organization_id, index_key,
    /// document_id)` conflict.
    pub async fn upsert_document(
        &self,
        params: &UpsertDocumentParams,
    ) -> RepositoryResult<SearchDocumentRow> {
        let uuid = Uuid::new_v4().to_string();
        sqlx::query_as::<sqlx::Postgres, SearchDocumentRow>(queries::DOCUMENT_UPSERT)
            .bind(params.id)
            .bind(uuid)
            .bind(params.tenant_id)
            .bind(params.organization_id)
            .bind(params.index_id)
            .bind(&params.index_key)
            .bind(&params.document_id)
            .bind(&params.capability)
            .bind(&params.scope)
            .bind(&params.group_key)
            .bind(&params.group_title)
            .bind(&params.source_ref)
            .bind(&params.title)
            .bind(&params.body_text)
            .bind(&params.keyword_text)
            .bind(&params.payload_json)
            .bind(&params.token_json)
            .bind(&params.embedding_json)
            .bind(params.status)
            .bind(params.data_scope)
            .fetch_one(&self.pool)
            .await
            .map_err(Into::into)
    }

    /// Returns the document matching `(index_key, document_id)`, or `None`.
    ///
    /// `organization_id` is required for tenant isolation per `RUST_CODE_SPEC.md` §6.
    pub async fn get_document(
        &self,
        tenant_id: i64,
        organization_id: i64,
        index_key: &str,
        document_id: &str,
    ) -> RepositoryResult<Option<SearchDocumentRow>> {
        sqlx::query_as::<sqlx::Postgres, SearchDocumentRow>(queries::DOCUMENT_GET)
            .bind(tenant_id)
            .bind(organization_id)
            .bind(index_key)
            .bind(document_id)
            .fetch_optional(&self.pool)
            .await
            .map_err(Into::into)
    }

    /// Soft-deletes a document by `(index_key, document_id)`.
    pub async fn delete_document(
        &self,
        tenant_id: i64,
        organization_id: i64,
        index_key: &str,
        document_id: &str,
        deleted_by: Option<i64>,
    ) -> RepositoryResult<()> {
        sqlx::query(queries::DOCUMENT_DELETE)
            .bind(deleted_by)
            .bind(tenant_id)
            .bind(organization_id)
            .bind(index_key)
            .bind(document_id)
            .execute(&self.pool)
            .await
            .map(|_| ())
            .map_err(Into::into)
    }

    /// Paginated listing of documents for an index.
    ///
    /// `page` is 1-based; `page_size` is the page length.
    pub async fn list_documents(
        &self,
        tenant_id: i64,
        organization_id: i64,
        index_key: &str,
        page: u32,
        page_size: u32,
    ) -> RepositoryResult<Vec<SearchDocumentRow>> {
        let (limit, offset) = paginate(page, page_size);
        sqlx::query_as::<sqlx::Postgres, SearchDocumentRow>(queries::DOCUMENT_LIST)
            .bind(tenant_id)
            .bind(organization_id)
            .bind(index_key)
            .bind(limit)
            .bind(offset)
            .fetch_all(&self.pool)
            .await
            .map_err(Into::into)
    }

    /// Fulltext search over `search_vector` using `plainto_tsquery`.
    pub async fn fulltext_search(
        &self,
        tenant_id: i64,
        organization_id: i64,
        index_key: &str,
        query: &str,
        page: u32,
        page_size: u32,
    ) -> RepositoryResult<Vec<SearchDocumentHitRow>> {
        let (limit, offset) = paginate(page, page_size);
        sqlx::query_as::<sqlx::Postgres, SearchDocumentHitRow>(queries::DOCUMENT_FULLTEXT_SEARCH)
            .bind(query)
            .bind(tenant_id)
            .bind(organization_id)
            .bind(index_key)
            .bind(limit)
            .bind(offset)
            .fetch_all(&self.pool)
            .await
            .map_err(Into::into)
    }

    /// Fuzzy search over `title` using `pg_trgm` similarity.
    pub async fn fuzzy_search(
        &self,
        tenant_id: i64,
        organization_id: i64,
        index_key: &str,
        query: &str,
        page: u32,
        page_size: u32,
    ) -> RepositoryResult<Vec<SearchDocumentHitRow>> {
        let (limit, offset) = paginate(page, page_size);
        sqlx::query_as::<sqlx::Postgres, SearchDocumentHitRow>(queries::DOCUMENT_FUZZY_SEARCH)
            .bind(query)
            .bind(tenant_id)
            .bind(organization_id)
            .bind(index_key)
            .bind(limit)
            .bind(offset)
            .fetch_all(&self.pool)
            .await
            .map_err(Into::into)
    }

    /// Semantic search using `pgvector` cosine distance (`<=>`).
    ///
    /// `query_embedding` is rendered as a pgvector literal string.
    pub async fn semantic_search(
        &self,
        tenant_id: i64,
        organization_id: i64,
        index_key: &str,
        query_embedding: &[f32],
        page: u32,
        page_size: u32,
    ) -> RepositoryResult<Vec<SearchDocumentHitRow>> {
        let (limit, offset) = paginate(page, page_size);
        let embedding_literal = format_vector_literal(query_embedding);
        sqlx::query_as::<sqlx::Postgres, SearchDocumentHitRow>(queries::DOCUMENT_SEMANTIC_SEARCH)
            .bind(embedding_literal)
            .bind(tenant_id)
            .bind(organization_id)
            .bind(index_key)
            .bind(limit)
            .bind(offset)
            .fetch_all(&self.pool)
            .await
            .map_err(Into::into)
    }

    /// Returns the underlying PostgreSQL pool.
    pub fn pool(&self) -> &PgPool {
        &self.pool
    }
}

/// Computes `(limit, offset)` from 1-based `page` and `page_size`.
fn paginate(page: u32, page_size: u32) -> (i64, i64) {
    let page = page.max(1);
    let page_size = page_size.max(1);
    let limit = page_size as i64;
    let offset = ((page - 1) as i64) * limit;
    (limit, offset)
}

/// Renders a float slice as a pgvector literal, e.g. `"[0.1,0.2,0.3]"`.
fn format_vector_literal(embedding: &[f32]) -> String {
    let mut body = String::from("[");
    for (i, value) in embedding.iter().enumerate() {
        if i > 0 {
            body.push(',');
        }
        body.push_str(&value.to_string());
    }
    body.push(']');
    body
}
