//! 文档上传端口：抽象 Drive 文件上传依赖，保持服务层高内聚低耦合。
//!
//! indexing-service 仅依赖此抽象端口；实际 Drive uploader 调用由基础设施层
//! （如 standalone-gateway bootstrap 的 `DriveDocumentUploader`）实现并注入。

use async_trait::async_trait;
use sdkwork_search_provider_spi::SearchProviderContext;

/// 上传文档请求参数。
#[derive(Debug, Clone)]
pub struct UploadDocumentRequest<'a> {
    /// 原始文件名。
    pub file_name: &'a str,
    /// MIME 内容类型，如 `text/plain`。
    pub content_type: &'a str,
    /// 文件字节内容。
    pub bytes: &'a [u8],
    /// 应用资源类型，如 `search_document`。
    pub app_resource_type: &'a str,
    /// 应用资源 ID，通常为文档 ID。
    pub app_resource_id: &'a str,
}

/// 上传成功后返回的 Drive 引用信息。
#[derive(Debug, Clone)]
pub struct UploadedDocument {
    /// Drive 空间 ID。
    pub drive_space_id: String,
    /// Drive 节点 ID。
    pub drive_node_id: String,
    /// 对象存储桶名（本地存储可能为空）。
    pub object_bucket: Option<String>,
    /// 对象存储键（本地存储可能为空）。
    pub object_key: Option<String>,
    /// 内容长度（字节）。
    pub content_length: i64,
    /// SHA256 校验和（十六进制）。
    pub checksum_sha256_hex: Option<String>,
}

/// 文档上传端口：由基础设施层（如 standalone-gateway bootstrap）实现，封装 Drive uploader 调用。
#[async_trait]
pub trait DocumentUploadPort: Send + Sync {
    /// 上传文档字节到 Drive 并返回引用信息。
    async fn upload_document(
        &self,
        ctx: &SearchProviderContext,
        request: &UploadDocumentRequest<'_>,
    ) -> Result<UploadedDocument, String>;
}
