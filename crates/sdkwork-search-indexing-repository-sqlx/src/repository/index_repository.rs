//! `SearchIndexRepository` - SQLx repository for the `search_index` aggregate.
//!
//! Concrete repository struct (no trait yet; the service crate will define the
//! repository port). Returns physical row types from [`crate::db::rows`].

use chrono::{DateTime, Utc};
use sqlx::PgPool;
use uuid::Uuid;

use crate::db::rows::{SearchIndexJobRow, SearchIndexRow};
use crate::error::RepositoryResult;
use crate::repository::queries;

/// Inputs for creating a search index.
#[derive(Debug, Clone)]
pub struct CreateIndexParams {
    pub id: i64,
    pub tenant_id: i64,
    pub organization_id: i64,
    pub index_key: String,
    pub title: String,
    pub description: Option<String>,
    pub config_json: serde_json::Value,
}

/// Inputs for updating a search index.
#[derive(Debug, Clone)]
pub struct UpdateIndexParams {
    pub id: i64,
    pub tenant_id: i64,
    pub title: String,
    pub description: Option<String>,
    pub status: i32,
    pub config_json: serde_json::Value,
}

/// Inputs for creating a search index job record.
#[derive(Debug, Clone)]
pub struct CreateIndexJobParams {
    pub id: i64,
    pub tenant_id: i64,
    pub organization_id: i64,
    pub index_key: String,
    pub job_type: String,
    pub payload_json: serde_json::Value,
}

/// SQLx repository for the `search_index` table.
pub struct SearchIndexRepository {
    pool: PgPool,
}

impl SearchIndexRepository {
    pub fn new(pool: PgPool) -> Self {
        Self { pool }
    }

    /// Returns all non-deleted indexes for a tenant/organization.
    pub async fn list_indexes(
        &self,
        tenant_id: i64,
        organization_id: i64,
    ) -> RepositoryResult<Vec<SearchIndexRow>> {
        sqlx::query_as::<sqlx::Postgres, SearchIndexRow>(queries::INDEX_LIST_INDEXES)
            .bind(tenant_id)
            .bind(organization_id)
            .fetch_all(&self.pool)
            .await
            .map_err(Into::into)
    }

    /// Returns the index matching `index_key`, or `None`.
    pub async fn get_index_by_key(
        &self,
        tenant_id: i64,
        organization_id: i64,
        index_key: &str,
    ) -> RepositoryResult<Option<SearchIndexRow>> {
        sqlx::query_as::<sqlx::Postgres, SearchIndexRow>(queries::INDEX_GET_BY_KEY)
            .bind(tenant_id)
            .bind(organization_id)
            .bind(index_key)
            .fetch_optional(&self.pool)
            .await
            .map_err(Into::into)
    }

    /// Creates a new search index and returns the persisted row.
    pub async fn create_index(
        &self,
        params: &CreateIndexParams,
    ) -> RepositoryResult<SearchIndexRow> {
        let uuid = Uuid::new_v4().to_string();
        sqlx::query_as::<sqlx::Postgres, SearchIndexRow>(queries::INDEX_CREATE)
            .bind(params.id)
            .bind(uuid)
            .bind(params.tenant_id)
            .bind(params.organization_id)
            .bind(&params.index_key)
            .bind(&params.title)
            .bind(&params.description)
            .bind(&params.config_json)
            .fetch_one(&self.pool)
            .await
            .map_err(Into::into)
    }

    /// Updates mutable fields of an index and returns the updated row.
    pub async fn update_index(
        &self,
        params: &UpdateIndexParams,
    ) -> RepositoryResult<SearchIndexRow> {
        sqlx::query_as::<sqlx::Postgres, SearchIndexRow>(queries::INDEX_UPDATE)
            .bind(&params.title)
            .bind(&params.description)
            .bind(params.status)
            .bind(&params.config_json)
            .bind(params.id)
            .bind(params.tenant_id)
            .fetch_one(&self.pool)
            .await
            .map_err(Into::into)
    }

    /// Soft-deletes an index by setting `deleted_at`/`deleted_by`.
    pub async fn delete_index(
        &self,
        tenant_id: i64,
        index_id: i64,
        deleted_by: Option<i64>,
    ) -> RepositoryResult<()> {
        sqlx::query(queries::INDEX_DELETE)
            .bind(deleted_by)
            .bind(index_id)
            .bind(tenant_id)
            .execute(&self.pool)
            .await
            .map(|_| ())
            .map_err(Into::into)
    }

    /// 创建索引任务记录，返回新行的 uuid 供后续状态跟踪。
    pub async fn create_index_job(
        &self,
        params: &CreateIndexJobParams,
    ) -> RepositoryResult<SearchIndexJobRow> {
        let uuid = Uuid::new_v4().to_string();
        sqlx::query_as::<sqlx::Postgres, SearchIndexJobRow>(queries::JOB_CREATE)
            .bind(params.id)
            .bind(&uuid)
            .bind(params.tenant_id)
            .bind(params.organization_id)
            .bind(&params.index_key)
            .bind(&params.job_type)
            .bind(&params.payload_json)
            .fetch_one(&self.pool)
            .await
            .map_err(Into::into)
    }

    /// 按任务 uuid 查询单条任务记录（带租户隔离），不存在返回 `None`。
    pub async fn get_index_job(
        &self,
        tenant_id: i64,
        job_uuid: &str,
    ) -> RepositoryResult<Option<SearchIndexJobRow>> {
        sqlx::query_as::<sqlx::Postgres, SearchIndexJobRow>(queries::JOB_GET)
            .bind(tenant_id)
            .bind(job_uuid)
            .fetch_optional(&self.pool)
            .await
            .map_err(Into::into)
    }

    /// 更新任务状态，返回实际更新行数（0 表示任务不存在或租户不匹配）。
    pub async fn update_index_job_status(
        &self,
        tenant_id: i64,
        job_uuid: &str,
        status: i32,
        started_at: Option<DateTime<Utc>>,
        finished_at: Option<DateTime<Utc>>,
        error_summary: Option<&str>,
    ) -> RepositoryResult<u64> {
        sqlx::query(queries::JOB_UPDATE_STATUS)
            .bind(status)
            .bind(started_at)
            .bind(finished_at)
            .bind(error_summary)
            .bind(job_uuid)
            .bind(tenant_id)
            .execute(&self.pool)
            .await
            .map(|res| res.rows_affected())
            .map_err(Into::into)
    }

    /// Returns the underlying PostgreSQL pool.
    pub fn pool(&self) -> &PgPool {
        &self.pool
    }
}
