//! Axum router assembly: mounts route crates and sdkwork-web-bootstrap infra routes.

use std::sync::Arc;

use axum::{
    extract::Multipart,
    response::{IntoResponse, Response},
    routing::post,
    Extension, Json, Router,
};
use sdkwork_api_search_assembly::{assemble_api_router, SearchAppState, SearchBackendState};
use sdkwork_search_indexing_service::ports::UploadDocumentRequest;
use sdkwork_search_indexing_service::IndexingService;
use sdkwork_search_provider_spi::{SearchProviderContext, SearchProviderContextBuilder};
use sdkwork_web_bootstrap::{mount_infra_routes, ReadinessCheck, ServiceRouterConfig};
use serde::Serialize;

use crate::bootstrap::ApplicationState;
use crate::health::build_readiness_check;

/// 上传成功的响应体。
#[derive(Debug, Serialize)]
struct UploadDocumentResponse {
    document_id: String,
    index_key: String,
}

/// 解析 multipart 表单得到的上传请求字段。
#[derive(Default)]
struct ParsedUploadForm {
    index_key: Option<String>,
    document_id: Option<String>,
    tenant_id: Option<i64>,
    organization_id: Option<i64>,
    file_name: Option<String>,
    content_type: Option<String>,
    bytes: Option<Vec<u8>>,
}

/// 处理 `/backend/search/documents/upload` 文档直传请求。
///
/// multipart 表单字段：
/// - `index_key`：目标索引键（必填）
/// - `document_id`：文档 ID（必填）
/// - `tenant_id`：租户 ID（可选，默认 0）
/// - `organization_id`：组织 ID（可选，默认 0）
/// - `file`：文件字段（必填，携带文件名与 content_type）
async fn upload_document(
    Extension(indexing_service): Extension<Arc<IndexingService>>,
    mut multipart: Multipart,
) -> Response {
    let parsed = match parse_upload_form(&mut multipart).await {
        Ok(parsed) => parsed,
        Err(message) => {
            return (
                axum::http::StatusCode::BAD_REQUEST,
                format!("invalid upload form: {message}"),
            )
                .into_response()
        }
    };

    let Some(index_key) = parsed.index_key else {
        return (
            axum::http::StatusCode::BAD_REQUEST,
            "missing required field: index_key".to_string(),
        )
            .into_response();
    };
    let Some(document_id) = parsed.document_id else {
        return (
            axum::http::StatusCode::BAD_REQUEST,
            "missing required field: document_id".to_string(),
        )
            .into_response();
    };
    let Some(file_name) = parsed.file_name else {
        return (
            axum::http::StatusCode::BAD_REQUEST,
            "missing required field: file".to_string(),
        )
            .into_response();
    };
    let Some(bytes) = parsed.bytes else {
        return (
            axum::http::StatusCode::BAD_REQUEST,
            "missing required field: file".to_string(),
        )
            .into_response();
    };

    let content_type = parsed
        .content_type
        .clone()
        .unwrap_or_else(|| "application/octet-stream".to_string());

    let ctx: SearchProviderContext = SearchProviderContextBuilder::default()
        .tenant_id(parsed.tenant_id.unwrap_or(0))
        .organization_id(parsed.organization_id.unwrap_or(0))
        .build();

    let request = UploadDocumentRequest {
        file_name: &file_name,
        content_type: &content_type,
        bytes: &bytes,
        app_resource_type: "search_document",
        app_resource_id: &document_id,
    };

    match indexing_service
        .ingest_document_from_upload(&ctx, &index_key, &document_id, &request)
        .await
    {
        Ok(()) => Json(UploadDocumentResponse {
            document_id,
            index_key,
        })
        .into_response(),
        Err(err) => (
            axum::http::StatusCode::INTERNAL_SERVER_ERROR,
            format!("ingest document failed: {err}"),
        )
            .into_response(),
    }
}

/// 解析 multipart 表单字段。
async fn parse_upload_form(multipart: &mut Multipart) -> Result<ParsedUploadForm, String> {
    let mut form = ParsedUploadForm::default();
    while let Some(field) = multipart
        .next_field()
        .await
        .map_err(|err| format!("read multipart field failed: {err}"))?
    {
        let name = field.name().unwrap_or_default().to_string();
        let file_name = field.file_name().map(|s| s.to_string());
        let content_type = field.content_type().map(|s| s.to_string());
        let bytes = field
            .bytes()
            .await
            .map_err(|err| format!("read multipart bytes failed: {err}"))?;

        match name.as_str() {
            "index_key" => {
                form.index_key = Some(String::from_utf8_lossy(&bytes).to_string());
            }
            "document_id" => {
                form.document_id = Some(String::from_utf8_lossy(&bytes).to_string());
            }
            "tenant_id" => {
                form.tenant_id = String::from_utf8_lossy(&bytes).parse().ok();
            }
            "organization_id" => {
                form.organization_id = String::from_utf8_lossy(&bytes).parse().ok();
            }
            "file" => {
                form.file_name = file_name;
                form.content_type = content_type;
                form.bytes = Some(bytes.to_vec());
            }
            _ => {}
        }
    }
    Ok(form)
}

/// Assemble the application router from route crates and infra routes.
///
/// Mounts `/healthz`, `/readyz`, `/metrics`, and optional contract fallback through
/// `sdkwork-web-bootstrap::mount_infra_routes`. Business route crates contribute
/// their `gateway_mount(state)` routers，state 持有 4 个 service 的 Arc 引用。
pub fn build_application_router(state: ApplicationState) -> Router {
    let pool = state.database_pool.clone();

    let app_state = SearchAppState::new(
        state.provider_registry.clone(),
        state.query_service.clone(),
        state.indexing_service.clone(),
        state.recommendation_service.clone(),
        state.promotion_service.clone(),
    );
    let backend_state = SearchBackendState::new(
        state.provider_registry.clone(),
        state.query_service.clone(),
        state.indexing_service.clone(),
        state.recommendation_service.clone(),
        state.promotion_service.clone(),
    );
    let indexing_service = state.indexing_service.clone();

    let assembly = assemble_api_router(app_state, backend_state);
    let router = assembly
        .router
        .route("/backend/search/documents/upload", post(upload_document))
        .layer(Extension(indexing_service));

    let readiness: Arc<dyn ReadinessCheck> = build_readiness_check(pool);
    let config = ServiceRouterConfig::default().with_readiness_check(readiness);

    mount_infra_routes(router, config)
}
