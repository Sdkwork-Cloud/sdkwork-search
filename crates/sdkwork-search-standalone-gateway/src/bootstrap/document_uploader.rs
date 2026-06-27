//! Drive 文档上传适配器：封装 `DriveUploaderService`，实现 `DocumentUploadPort`。
//!
//! indexing-service 仅依赖 `DocumentUploadPort` 抽象端口；本模块是基础设施层适配器，
//! 将 Drive uploader 的具体调用收敛在 standalone-gateway bootstrap 层，保持服务层高内聚低耦合。
//! Phase 5 使用 `LocalDriveObjectStore` 作为对象存储实现。

use async_trait::async_trait;
use sdkwork_drive_storage_local::LocalDriveObjectStore;
use sdkwork_drive_uploader_service::service::{
    DriveUploaderService, PrepareUploaderUploadCommand, UploadBytesCommand, UploaderActor,
    UploaderRetention, UploaderTarget,
};
use sdkwork_drive_workspace_service::infrastructure::sql::uploader_store::SqlUploaderStore;
use sdkwork_search_indexing_service::ports::{
    DocumentUploadPort, UploadDocumentRequest, UploadedDocument,
};
use sdkwork_search_provider_spi::SearchProviderContext;
use sdkwork_utils_rust::sha256_hash;
use sqlx::AnyPool;
use uuid::Uuid;

/// 基于 Drive Uploader Service 的文档上传实现。
pub struct DriveDocumentUploader {
    service: DriveUploaderService<SqlUploaderStore>,
    object_store: LocalDriveObjectStore,
    app_id: String,
}

impl DriveDocumentUploader {
    /// 构造适配器：传入 AnyPool（Drive 仓库依赖）、本地对象存储与应用标识。
    pub fn new(
        pool: AnyPool,
        object_store: LocalDriveObjectStore,
        app_id: impl Into<String>,
    ) -> Self {
        let store = SqlUploaderStore::new(pool);
        let service = DriveUploaderService::new(store);
        Self {
            service,
            object_store,
            app_id: app_id.into(),
        }
    }
}

#[async_trait]
impl DocumentUploadPort for DriveDocumentUploader {
    async fn upload_document(
        &self,
        ctx: &SearchProviderContext,
        request: &UploadDocumentRequest<'_>,
    ) -> Result<UploadedDocument, String> {
        let now_ms = chrono::Utc::now().timestamp_millis();
        let fingerprint = sha256_hash(request.bytes);
        let content_length = request.bytes.len() as i64;

        let prepare = PrepareUploaderUploadCommand {
            id: Uuid::new_v4().to_string(),
            task_id: Uuid::new_v4().to_string(),
            tenant_id: ctx.tenant_id.to_string(),
            organization_id: if ctx.organization_id > 0 {
                Some(ctx.organization_id.to_string())
            } else {
                None
            },
            actor: UploaderActor::System {
                operator_id: "sdkwork-search".to_string(),
            },
            app_id: self.app_id.clone(),
            app_resource_type: request.app_resource_type.to_string(),
            app_resource_id: request.app_resource_id.to_string(),
            scene: Some("search".to_string()),
            source: None,
            upload_profile_code: "document".to_string(),
            file_fingerprint: fingerprint,
            original_file_name: request.file_name.to_string(),
            content_type: request.content_type.to_string(),
            content_length,
            chunk_size_bytes: 5 * 1024 * 1024,
            target: UploaderTarget::AutoUploadSpace {
                parent_node_id: None,
            },
            retention: UploaderRetention::LongTerm,
            operator_id: "sdkwork-search".to_string(),
            now_epoch_ms: now_ms,
        };

        let command = UploadBytesCommand {
            prepare,
            body: request.bytes.to_vec(),
            uploaded_at_epoch_ms: now_ms,
        };

        // DriveServiceError 未实现 Display，使用 Debug 格式化错误信息。
        let item = self
            .service
            .upload_bytes(&self.object_store, command)
            .await
            .map_err(|e| format!("{e:?}"))?;

        Ok(UploadedDocument {
            drive_space_id: item.space_id,
            drive_node_id: item.node_id,
            object_bucket: item.object_bucket,
            object_key: item.object_key,
            content_length: item.content_length,
            checksum_sha256_hex: item.checksum_sha256_hex,
        })
    }
}
