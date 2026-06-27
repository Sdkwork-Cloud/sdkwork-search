//! Indexing service - document indexing and index lifecycle orchestration.

use std::sync::Arc;

use sdkwork_search_provider_spi::{
    DeleteDocument, IndexDocument, IndexDocumentBatch, IndexOperationResult, SearchProvider,
    SearchProviderCapability, SearchProviderContext, SearchProviderRegistry, UpdateDocument,
};
use tracing::{debug, warn};

use crate::domain::{DocumentSummary, IndexJob, IndexStats};
use crate::error::{IndexingServiceError, IndexingServiceResult};
use crate::ports::{DocumentUploadPort, IndexingRepositoryPort, UploadDocumentRequest};

/// Orchestrates document indexing and index lifecycle against the provider registry, persisting
/// indexing metadata through the repository port.
pub struct IndexingService {
    provider_registry: Arc<SearchProviderRegistry>,
    repository: Arc<dyn IndexingRepositoryPort>,
    document_uploader: Arc<dyn DocumentUploadPort>,
}

impl IndexingService {
    pub fn new(
        provider_registry: Arc<SearchProviderRegistry>,
        repository: Arc<dyn IndexingRepositoryPort>,
        document_uploader: Arc<dyn DocumentUploadPort>,
    ) -> Self {
        Self {
            provider_registry,
            repository,
            document_uploader,
        }
    }

    /// Select a provider that supports indexing, falling back to the default provider.
    fn indexing_provider(&self) -> IndexingServiceResult<Arc<dyn SearchProvider>> {
        self.provider_registry
            .select_for_capability(SearchProviderCapability::Indexing)
            .or_else(|_| self.provider_registry.select_default())
            .map_err(IndexingServiceError::from)
    }

    /// Index a single document through the provider and persist its metadata.
    pub async fn index_document(
        &self,
        ctx: &SearchProviderContext,
        doc: IndexDocument,
    ) -> IndexingServiceResult<()> {
        let provider = self.indexing_provider()?;
        provider.index_document(ctx, &doc).await?;
        if let Err(err) = self.repository.upsert_document(ctx, &doc).await {
            warn!(error = %err, "failed to persist index document metadata");
        }
        Ok(())
    }

    /// 上传文档到 Drive 并索引其文本内容。
    ///
    /// 流程：Drive 上传 → 提取文本 → 构造 IndexDocument（含 drive 引用）
    ///       → provider 索引 → 仓库持久化。当前文本提取仅支持 UTF-8 文本，
    ///       后续可扩展为可插拔提取器。
    pub async fn ingest_document_from_upload(
        &self,
        ctx: &SearchProviderContext,
        index_key: &str,
        document_id: &str,
        upload_request: &UploadDocumentRequest<'_>,
    ) -> IndexingServiceResult<()> {
        // 1. 上传到 Drive
        let uploaded = self
            .document_uploader
            .upload_document(ctx, upload_request)
            .await
            .map_err(IndexingServiceError::Upload)?;

        // 2. 提取文本内容（当前仅支持 UTF-8 文本，后续可扩展为可插拔提取器）
        let content = std::str::from_utf8(upload_request.bytes)
            .ok()
            .map(|s| s.to_string());

        // 3. 构造 IndexDocument（含 drive 引用）
        let doc = IndexDocument {
            index_key: index_key.to_string(),
            document_id: document_id.to_string(),
            source: serde_json::json!({
                "file_name": upload_request.file_name,
                "content_type": upload_request.content_type,
                "drive_space_id": uploaded.drive_space_id,
                "drive_node_id": uploaded.drive_node_id,
            }),
            title: Some(upload_request.file_name.to_string()),
            content,
            tags: vec![],
            drive_space_id: Some(uploaded.drive_space_id.clone()),
            drive_node_id: Some(uploaded.drive_node_id.clone()),
            embedding: vec![],
        };

        // 4. provider 索引
        let provider = self.indexing_provider()?;
        provider.index_document(ctx, &doc).await?;

        // 5. 仓库持久化（与 index_document 一致，持久化失败仅告警不阻断流程）
        if let Err(err) = self.repository.upsert_document(ctx, &doc).await {
            warn!(error = %err, "failed to persist uploaded index document metadata");
        }
        Ok(())
    }

    /// Index a batch of documents through the provider.
    pub async fn index_batch(
        &self,
        ctx: &SearchProviderContext,
        batch: IndexDocumentBatch,
    ) -> IndexingServiceResult<IndexOperationResult> {
        let provider = self.indexing_provider()?;
        let result = provider.index_batch(ctx, &batch).await?;
        Ok(result)
    }

    /// Update a document through the provider.
    pub async fn update_document(
        &self,
        ctx: &SearchProviderContext,
        doc: UpdateDocument,
    ) -> IndexingServiceResult<()> {
        let provider = self.indexing_provider()?;
        provider.update_document(ctx, &doc).await?;
        Ok(())
    }

    /// Delete a document through the provider and remove its metadata.
    pub async fn delete_document(
        &self,
        ctx: &SearchProviderContext,
        doc: DeleteDocument,
    ) -> IndexingServiceResult<()> {
        let provider = self.indexing_provider()?;
        provider.delete_document(ctx, &doc).await?;
        if let Err(err) = self
            .repository
            .delete_document(ctx, &doc.index_key, &doc.document_id)
            .await
        {
            warn!(error = %err, "failed to persist delete document metadata");
        }
        Ok(())
    }

    /// Create an index through the provider and persist its metadata.
    pub async fn create_index(
        &self,
        ctx: &SearchProviderContext,
        index_key: &str,
        schema: &serde_json::Value,
    ) -> IndexingServiceResult<()> {
        let provider = self.indexing_provider()?;
        provider.create_index(ctx, index_key, schema).await?;
        if let Err(err) = self.repository.create_index(ctx, index_key, schema).await {
            warn!(error = %err, "failed to persist index metadata");
        }
        Ok(())
    }

    /// Drop an index through the provider.
    pub async fn drop_index(
        &self,
        ctx: &SearchProviderContext,
        index_key: &str,
    ) -> IndexingServiceResult<()> {
        let provider = self.indexing_provider()?;
        provider.drop_index(ctx, index_key).await?;
        Ok(())
    }

    /// 更新索引元数据配置，委托到 repository。
    pub async fn update_index(
        &self,
        ctx: &SearchProviderContext,
        index_key: &str,
        title: Option<&str>,
        description: Option<&str>,
        status: Option<i32>,
        config_json: Option<&serde_json::Value>,
    ) -> IndexingServiceResult<bool> {
        self.repository
            .update_index(ctx, index_key, title, description, status, config_json)
            .await
            .map_err(IndexingServiceError::Repository)
    }

    /// 重建索引：创建任务 → drop → recreate → 标记完成。
    /// 当前为同步实现，后续可扩展为异步任务队列。
    pub async fn rebuild_index(
        &self,
        ctx: &SearchProviderContext,
        index_key: &str,
        schema: &serde_json::Value,
    ) -> IndexingServiceResult<String> {
        // 1. 创建 job 记录
        let job_uuid = self
            .repository
            .create_index_job(ctx, index_key, "rebuild", &serde_json::json!({}))
            .await
            .map_err(IndexingServiceError::Repository)?;

        // 2. 标记 job 开始（status=1 running）
        let now = chrono::Utc::now();
        self.repository
            .update_index_job_status(ctx, &job_uuid, 1, Some(now), None, None)
            .await
            .map_err(IndexingServiceError::Repository)?;

        // 3. drop + recreate；失败则标记 job 失败（status=3）后返回错误。
        if let Err(err) = self.drop_index(ctx, index_key).await {
            let _ = self
                .repository
                .update_index_job_status(
                    ctx,
                    &job_uuid,
                    3,
                    None,
                    Some(chrono::Utc::now()),
                    Some(&err.to_string()),
                )
                .await;
            return Err(err);
        }
        if let Err(err) = self.create_index(ctx, index_key, schema).await {
            let _ = self
                .repository
                .update_index_job_status(
                    ctx,
                    &job_uuid,
                    3,
                    None,
                    Some(chrono::Utc::now()),
                    Some(&err.to_string()),
                )
                .await;
            return Err(err);
        }

        // 4. 标记完成（status=2 completed）
        self.repository
            .update_index_job_status(ctx, &job_uuid, 2, None, Some(chrono::Utc::now()), None)
            .await
            .map_err(IndexingServiceError::Repository)?;

        Ok(job_uuid)
    }

    /// 列出当前租户/组织下的所有索引 key，委托到 repository。
    pub async fn list_indexes(
        &self,
        ctx: &SearchProviderContext,
    ) -> IndexingServiceResult<Vec<String>> {
        self.repository
            .list_indexes(ctx)
            .await
            .map_err(IndexingServiceError::Repository)
    }

    /// 按索引 key 查询单个索引元数据，委托到 repository。
    pub async fn get_index(
        &self,
        ctx: &SearchProviderContext,
        index_key: &str,
    ) -> IndexingServiceResult<Option<IndexJob>> {
        self.repository
            .get_index(ctx, index_key)
            .await
            .map_err(IndexingServiceError::Repository)
    }

    /// 分页列出索引内文档，委托到 repository。
    pub async fn list_documents(
        &self,
        ctx: &SearchProviderContext,
        index_key: &str,
        page: u32,
        page_size: u32,
    ) -> IndexingServiceResult<Vec<DocumentSummary>> {
        debug!(%index_key, page, page_size, "listing documents");
        self.repository
            .list_documents(ctx, index_key, page, page_size)
            .await
            .map_err(IndexingServiceError::Repository)
    }

    /// 统计索引内文档数量，委托到 repository。
    pub async fn count_documents(
        &self,
        ctx: &SearchProviderContext,
        index_key: &str,
    ) -> IndexingServiceResult<u64> {
        debug!(%index_key, "counting documents");
        self.repository
            .count_documents(ctx, index_key)
            .await
            .map_err(IndexingServiceError::Repository)
    }

    /// 按 ID 获取单个文档摘要，委托到 repository。
    pub async fn get_document(
        &self,
        ctx: &SearchProviderContext,
        index_key: &str,
        document_id: &str,
    ) -> IndexingServiceResult<Option<DocumentSummary>> {
        debug!(%index_key, %document_id, "getting document");
        self.repository
            .get_document(ctx, index_key, document_id)
            .await
            .map_err(IndexingServiceError::Repository)
    }

    /// 获取索引统计，委托到 repository。
    pub async fn get_index_stats(
        &self,
        ctx: &SearchProviderContext,
        index_key: &str,
    ) -> IndexingServiceResult<IndexStats> {
        debug!(%index_key, "getting index stats");
        self.repository
            .get_index_stats(ctx, index_key)
            .await
            .map_err(IndexingServiceError::Repository)
    }

    /// 批量删除文档，委托到 repository。返回实际删除行数。
    pub async fn bulk_delete_documents(
        &self,
        ctx: &SearchProviderContext,
        index_key: &str,
        document_ids: &[String],
    ) -> IndexingServiceResult<u64> {
        debug!(%index_key, count = document_ids.len(), "bulk deleting documents");
        self.repository
            .bulk_delete_documents(ctx, index_key, document_ids)
            .await
            .map_err(IndexingServiceError::Repository)
    }
}
