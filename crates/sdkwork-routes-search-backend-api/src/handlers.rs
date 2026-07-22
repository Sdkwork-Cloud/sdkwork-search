//! Thin HTTP adapters for search backend-api (`WEB_BACKEND_SPEC.md` §2).
//!
//! Handlers 是薄适配器：解析请求 -> 调用 service -> 将结果/错误映射为 HTTP 响应。
//! 业务规则全部位于 service 层，handler 不持有任何业务逻辑。

use crate::state::SearchBackendState;
use axum::extract::{Path, Query, State};
use axum::http::StatusCode;
use axum::Json;
use sdkwork_search_promotion_service::domain::{
    CreatePromotionInput, PromotionPlacement, UpdatePromotionInput,
};
use sdkwork_search_provider_spi::{
    DeleteDocument, IndexDocument, IndexDocumentBatch, SearchProviderContext,
};
use serde::Deserialize;
use serde_json::{json, Value};

/// handler 统一返回类型：成功为 JSON body，失败为 (状态码, JSON error body)。
type HandlerResult = Result<Json<Value>, (StatusCode, Json<Value>)>;

/// TODO: 从 web-framework WebRequestContext 中间件提取租户/用户上下文。
/// 当前阶段使用默认上下文，待 web-framework 集成完成后替换为中间件注入的 context。
fn provider_context() -> SearchProviderContext {
    SearchProviderContext::default()
}

/// 将 service 错误映射为 HTTP 500 响应，body 为 `{"error": message}`。
fn service_error<E: std::fmt::Display>(err: E) -> (StatusCode, Json<Value>) {
    (
        StatusCode::INTERNAL_SERVER_ERROR,
        Json(json!({ "error": err.to_string() })),
    )
}

/// 将可序列化结果包装为 JSON 成功响应。
fn ok_json<T: serde::Serialize>(value: T) -> Json<Value> {
    Json(serde_json::to_value(value).unwrap_or_else(|_| json!({})))
}

/// `GET /backend/v3/api/search/indexes` — 列出当前租户的所有索引 key。
pub(crate) async fn list_indexes(State(state): State<SearchBackendState>) -> HandlerResult {
    let ctx = provider_context();
    let indexes = state
        .indexing_service
        .list_indexes(&ctx)
        .await
        .map_err(service_error)?;
    Ok(Json(json!({ "indexes": indexes })))
}

/// `POST /backend/v3/api/search/indexes` — 创建索引。
#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
pub(crate) struct CreateIndexBody {
    index_key: String,
    schema: serde_json::Value,
}

pub(crate) async fn create_index(
    State(state): State<SearchBackendState>,
    Json(body): Json<CreateIndexBody>,
) -> HandlerResult {
    let ctx = provider_context();
    state
        .indexing_service
        .create_index(&ctx, &body.index_key, &body.schema)
        .await
        .map_err(service_error)?;
    Ok(Json(json!({ "created": true, "indexKey": body.index_key })))
}

/// `DELETE /backend/v3/api/search/indexes/{index_key}` — 删除索引。
pub(crate) async fn delete_index(
    State(state): State<SearchBackendState>,
    Path(index_key): Path<String>,
) -> HandlerResult {
    let ctx = provider_context();
    state
        .indexing_service
        .drop_index(&ctx, &index_key)
        .await
        .map_err(service_error)?;
    Ok(Json(json!({ "deleted": true, "indexKey": index_key })))
}

/// `PATCH /backend/v3/api/search/indexes/{index_key}` — 更新索引元数据。
#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
pub(crate) struct UpdateIndexBody {
    title: Option<String>,
    description: Option<String>,
    status: Option<i32>,
    config_json: Option<serde_json::Value>,
}

pub(crate) async fn update_index(
    State(state): State<SearchBackendState>,
    Path(index_key): Path<String>,
    Json(body): Json<UpdateIndexBody>,
) -> HandlerResult {
    let ctx = provider_context();
    let updated = state
        .indexing_service
        .update_index(
            &ctx,
            &index_key,
            body.title.as_deref(),
            body.description.as_deref(),
            body.status,
            body.config_json.as_ref(),
        )
        .await
        .map_err(service_error)?;
    Ok(Json(json!({ "updated": updated, "indexKey": index_key })))
}

/// `POST /backend/v3/api/search/indexes/{index_key}/rebuild` — 重建索引。
#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
pub(crate) struct RebuildIndexBody {
    schema: serde_json::Value,
}

pub(crate) async fn rebuild_index(
    State(state): State<SearchBackendState>,
    Path(index_key): Path<String>,
    Json(body): Json<RebuildIndexBody>,
) -> HandlerResult {
    let ctx = provider_context();
    let job_uuid = state
        .indexing_service
        .rebuild_index(&ctx, &index_key, &body.schema)
        .await
        .map_err(service_error)?;
    Ok(Json(
        json!({ "jobId": job_uuid, "indexKey": index_key, "status": "completed" }),
    ))
}

/// `GET /backend/v3/api/search/providers` — 列出所有已注册的 provider。
pub(crate) async fn list_providers(State(state): State<SearchBackendState>) -> HandlerResult {
    let providers: Vec<Value> = state
        .provider_registry
        .providers()
        .iter()
        .map(|p| {
            json!({
                "kind": p.kind().as_str(),
                "id": p.id(),
                "capabilities": serde_json::to_value(p.capabilities()).unwrap_or_default(),
            })
        })
        .collect();
    Ok(Json(json!({ "providers": providers })))
}

/// `GET /backend/v3/api/search/providers/health` — 默认 provider 健康检查。
pub(crate) async fn provider_health(State(state): State<SearchBackendState>) -> HandlerResult {
    let provider = state
        .provider_registry
        .select_default()
        .map_err(service_error)?;
    let healthy = provider.health().await.map_err(service_error)?;
    Ok(Json(json!({ "healthy": healthy })))
}

/// `GET /backend/v3/api/search/documents` — 列出文档。
#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
pub(crate) struct ListDocumentsParams {
    index_key: String,
    page: Option<u32>,
    page_size: Option<u32>,
}

pub(crate) async fn list_documents(
    State(state): State<SearchBackendState>,
    Query(params): Query<ListDocumentsParams>,
) -> HandlerResult {
    let ctx = provider_context();
    let page = params.page.unwrap_or(1);
    let page_size = params.page_size.unwrap_or(20);
    let docs = state
        .indexing_service
        .list_documents(&ctx, &params.index_key, page, page_size)
        .await
        .map_err(service_error)?;
    let total = state
        .indexing_service
        .count_documents(&ctx, &params.index_key)
        .await
        .map_err(service_error)?;
    Ok(Json(json!({
        "documents": serde_json::to_value(docs).unwrap_or_default(),
        "total": total,
        "page": page,
        "pageSize": page_size,
    })))
}

/// `DELETE /backend/v3/api/search/documents/{document_id}` — 删除单个文档。
#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
pub(crate) struct DeleteDocumentParams {
    index_key: String,
}

pub(crate) async fn delete_document(
    State(state): State<SearchBackendState>,
    Path(document_id): Path<String>,
    Query(params): Query<DeleteDocumentParams>,
) -> HandlerResult {
    let ctx = provider_context();
    let doc = DeleteDocument {
        index_key: params.index_key,
        document_id,
    };
    state
        .indexing_service
        .delete_document(&ctx, doc)
        .await
        .map_err(service_error)?;
    Ok(Json(json!({ "deleted": true })))
}

/// `POST /backend/v3/api/search/documents/index` — 索引单个文档。
pub(crate) async fn index_document(
    State(state): State<SearchBackendState>,
    Json(body): Json<IndexDocument>,
) -> HandlerResult {
    let ctx = provider_context();
    state
        .indexing_service
        .index_document(&ctx, body)
        .await
        .map_err(service_error)?;
    Ok(Json(json!({ "indexed": true })))
}

/// `POST /backend/v3/api/search/documents/batch` — 批量索引文档。
pub(crate) async fn batch_index_documents(
    State(state): State<SearchBackendState>,
    Json(body): Json<IndexDocumentBatch>,
) -> HandlerResult {
    let ctx = provider_context();
    let result = state
        .indexing_service
        .index_batch(&ctx, body)
        .await
        .map_err(service_error)?;
    Ok(ok_json(result))
}

/// `GET /backend/v3/api/search/recommendations/strategies` — 列出支持的推荐策略。
pub(crate) async fn list_recommendation_strategies(
    State(state): State<SearchBackendState>,
) -> HandlerResult {
    let ctx = provider_context();
    let strategies = state
        .recommendation_service
        .list_strategies(&ctx)
        .await
        .map_err(service_error)?;
    Ok(Json(
        json!({ "strategies": serde_json::to_value(strategies).unwrap_or_default() }),
    ))
}

/// `GET /backend/v3/api/search/promotions` — 列出活跃的 promotion。
#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
pub(crate) struct ListPromotionsParams {
    index_key: String,
    placement: PromotionPlacement,
}

pub(crate) async fn list_promotions(
    State(state): State<SearchBackendState>,
    Query(params): Query<ListPromotionsParams>,
) -> HandlerResult {
    let ctx = provider_context();
    let promotions = state
        .promotion_service
        .list_promotions(&ctx, &params.index_key, params.placement)
        .await
        .map_err(service_error)?;
    Ok(Json(
        json!({ "promotions": serde_json::to_value(promotions).unwrap_or_default() }),
    ))
}

/// `POST /backend/v3/api/search/promotions` — 创建 promotion。
pub(crate) async fn create_promotion(
    State(state): State<SearchBackendState>,
    Json(body): Json<CreatePromotionInput>,
) -> HandlerResult {
    let ctx = provider_context();
    let promotion = state
        .promotion_service
        .create_promotion(&ctx, &body)
        .await
        .map_err(service_error)?;
    Ok(Json(serde_json::to_value(promotion).unwrap_or_default()))
}

/// `PATCH /backend/v3/api/search/promotions/{promotion_id}` — 更新 promotion。
pub(crate) async fn update_promotion(
    State(state): State<SearchBackendState>,
    Path(promotion_id): Path<String>,
    Json(body): Json<UpdatePromotionInput>,
) -> HandlerResult {
    let ctx = provider_context();
    let promotion = state
        .promotion_service
        .update_promotion(&ctx, &promotion_id, &body)
        .await
        .map_err(service_error)?;
    Ok(Json(serde_json::to_value(promotion).unwrap_or_default()))
}

/// `DELETE /backend/v3/api/search/promotions/{promotion_id}` — 删除 promotion。
pub(crate) async fn delete_promotion(
    State(state): State<SearchBackendState>,
    Path(promotion_id): Path<String>,
) -> HandlerResult {
    let ctx = provider_context();
    state
        .promotion_service
        .delete_promotion(&ctx, &promotion_id)
        .await
        .map_err(service_error)?;
    Ok(Json(json!({ "deleted": true })))
}

/// `GET /backend/v3/api/search/audit` — 列出审计记录。
///
/// TODO: audit 查询读取 port 待 P2 阶段新增（当前 SearchQueryRepositoryPort 无 list_audit 读取方法）。
pub(crate) async fn list_audit(State(_state): State<SearchBackendState>) -> HandlerResult {
    Err((
        StatusCode::NOT_IMPLEMENTED,
        Json(json!({
            "error": "audit list is not implemented",
            "hint": "requires a new audit read port on SearchQueryRepositoryPort"
        })),
    ))
}
