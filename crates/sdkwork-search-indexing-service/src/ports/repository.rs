//! Repository port for indexing metadata persistence.

use async_trait::async_trait;
use chrono::{DateTime, Utc};
use sdkwork_search_provider_spi::{IndexDocument, SearchProviderContext};

use crate::domain::{DocumentSummary, IndexJob, IndexJobStatus, IndexStats};

/// Persistence port for index metadata and document indexing records.
///
/// Implementations live in repository crates (e.g. SQLx). The service layer calls these methods to
/// persist indexing state alongside provider index operations.
#[async_trait]
pub trait IndexingRepositoryPort: Send + Sync {
    /// Upsert a document record for the given index.
    async fn upsert_document(
        &self,
        ctx: &SearchProviderContext,
        doc: &IndexDocument,
    ) -> Result<(), String>;

    /// Delete a document record from the given index.
    async fn delete_document(
        &self,
        ctx: &SearchProviderContext,
        index_key: &str,
        document_id: &str,
    ) -> Result<(), String>;

    /// Get an index job record by index key.
    async fn get_index(
        &self,
        ctx: &SearchProviderContext,
        index_key: &str,
    ) -> Result<Option<IndexJob>, String>;

    /// Create an index metadata record.
    async fn create_index(
        &self,
        ctx: &SearchProviderContext,
        index_key: &str,
        schema: &serde_json::Value,
    ) -> Result<(), String>;

    /// 更新索引元数据（title/description/status/config_json）。
    /// 通过 index_key + tenant_id 定位，不存在返回 false。
    async fn update_index(
        &self,
        ctx: &SearchProviderContext,
        index_key: &str,
        title: Option<&str>,
        description: Option<&str>,
        status: Option<i32>,
        config_json: Option<&serde_json::Value>,
    ) -> Result<bool, String>;

    /// 创建索引重建任务记录，返回任务 uuid 供后续状态跟踪。
    async fn create_index_job(
        &self,
        ctx: &SearchProviderContext,
        index_key: &str,
        job_type: &str,
        payload: &serde_json::Value,
    ) -> Result<String, String>;

    /// 获取索引任务状态，任务不存在返回 `None`。
    async fn get_index_job(
        &self,
        ctx: &SearchProviderContext,
        job_uuid: &str,
    ) -> Result<Option<IndexJobStatus>, String>;

    /// 更新任务状态。`status` 为整数编码：0=pending、1=running、2=completed、3=failed。
    /// 未命中（任务不存在或租户不匹配）返回 false。
    async fn update_index_job_status(
        &self,
        ctx: &SearchProviderContext,
        job_uuid: &str,
        status: i32,
        started_at: Option<DateTime<Utc>>,
        finished_at: Option<DateTime<Utc>>,
        error_summary: Option<&str>,
    ) -> Result<bool, String>;

    /// List all index keys for the context tenant/organization.
    async fn list_indexes(&self, ctx: &SearchProviderContext) -> Result<Vec<String>, String>;

    /// 分页列出索引内文档。
    ///
    /// `page` 为 1 基页码，`page_size` 为每页条数。返回文档摘要列表。
    async fn list_documents(
        &self,
        ctx: &SearchProviderContext,
        index_key: &str,
        page: u32,
        page_size: u32,
    ) -> Result<Vec<DocumentSummary>, String>;

    /// 统计索引内文档数量（未软删除）。
    async fn count_documents(
        &self,
        ctx: &SearchProviderContext,
        index_key: &str,
    ) -> Result<u64, String>;

    /// 按 ID 获取单个文档摘要，不存在返回 `None`。
    async fn get_document(
        &self,
        ctx: &SearchProviderContext,
        index_key: &str,
        document_id: &str,
    ) -> Result<Option<DocumentSummary>, String>;

    /// 获取索引统计信息（文档总数、活跃文档数、最后更新时间）。
    async fn get_index_stats(
        &self,
        ctx: &SearchProviderContext,
        index_key: &str,
    ) -> Result<IndexStats, String>;

    /// 批量软删除文档，返回实际删除的行数。
    async fn bulk_delete_documents(
        &self,
        ctx: &SearchProviderContext,
        index_key: &str,
        document_ids: &[String],
    ) -> Result<u64, String>;
}
