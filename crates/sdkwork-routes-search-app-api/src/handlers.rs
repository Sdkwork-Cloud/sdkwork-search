//! Thin HTTP adapters for search app-api (`WEB_BACKEND_SPEC.md` §2).
//!
//! Handlers 是薄适配器：解析请求 -> 调用 service -> 将结果/错误映射为 HTTP 响应。
//! 业务规则全部位于 service 层，handler 不持有任何业务逻辑。

use crate::state::SearchAppState;
use axum::extract::{Query, State};
use axum::http::StatusCode;
use axum::Json;
use sdkwork_search_provider_spi::{
    SearchProviderContext, SearchQuery, SearchSuggestionQuery, SemanticSearchQuery,
};
use sdkwork_search_recommendation_service::domain::RecommendationStrategyType;
use serde::{Deserialize, Serialize};
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

/// `POST /app/v3/api/search/queries` — 执行一次搜索查询。
pub(crate) async fn create_search_query(
    State(state): State<SearchAppState>,
    Json(mut body): Json<SearchQuery>,
) -> HandlerResult {
    let ctx = provider_context();
    // 租户/组织上下文来自 request context，而非请求体。
    body.tenant_id = ctx.tenant_id;
    body.organization_id = ctx.organization_id;
    let response = state
        .query_service
        .execute_query(&ctx, body)
        .await
        .map_err(service_error)?;
    Ok(ok_json(response))
}

/// `GET /app/v3/api/search/indexes` — 列出当前租户可用的索引。
pub(crate) async fn list_search_indexes(State(state): State<SearchAppState>) -> HandlerResult {
    let ctx = provider_context();
    let indexes = state
        .indexing_service
        .list_indexes(&ctx)
        .await
        .map_err(service_error)?;
    Ok(Json(json!({ "indexes": indexes })))
}

/// `GET /app/v3/api/search/suggestions` — 获取搜索补全建议。
#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
pub(crate) struct SuggestionParams {
    index_key: String,
    prefix: String,
    #[serde(default = "default_suggestion_limit", rename = "page_size")]
    page_size: u32,
}

fn default_suggestion_limit() -> u32 {
    10
}

pub(crate) async fn list_search_suggestions(
    State(state): State<SearchAppState>,
    Query(params): Query<SuggestionParams>,
) -> HandlerResult {
    let ctx = provider_context();
    let query = SearchSuggestionQuery {
        tenant_id: ctx.tenant_id,
        organization_id: ctx.organization_id,
        index_key: params.index_key,
        prefix: params.prefix,
        limit: params.page_size,
        filters: Default::default(),
    };
    let response = state
        .query_service
        .get_suggestions(&ctx, query)
        .await
        .map_err(service_error)?;
    Ok(ok_json(response))
}

/// `POST /app/v3/api/search/recommendations` — 创建推荐请求。
#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
pub(crate) struct CreateRecommendationBody {
    strategy: RecommendationStrategyType,
    user_id: String,
    index_key: String,
    #[serde(default = "default_recommendation_limit", rename = "page_size")]
    page_size: u32,
}

fn default_recommendation_limit() -> u32 {
    10
}

pub(crate) async fn create_search_recommendation(
    State(state): State<SearchAppState>,
    Json(body): Json<CreateRecommendationBody>,
) -> HandlerResult {
    let ctx = provider_context();
    let user_id = body.user_id.parse::<i64>().map_err(|_| {
        (
            StatusCode::BAD_REQUEST,
            Json(json!({ "error": "invalid userId: expected i64 string form" })),
        )
    })?;
    let response = state
        .recommendation_service
        .recommend(&ctx, body.strategy, user_id, &body.index_key, body.limit)
        .await
        .map_err(service_error)?;
    Ok(ok_json(response))
}

/// `POST /app/v3/api/search/promotions` — 投递一条 promotion。
#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
pub(crate) struct CreatePromotionDeliveryBody {
    promotion_id: String,
    user_id: String,
}

pub(crate) async fn create_search_promotion_delivery(
    State(state): State<SearchAppState>,
    Json(body): Json<CreatePromotionDeliveryBody>,
) -> HandlerResult {
    let ctx = provider_context();
    let user_id = body.user_id.parse::<i64>().map_err(|_| {
        (
            StatusCode::BAD_REQUEST,
            Json(json!({ "error": "invalid userId: expected i64 string form" })),
        )
    })?;
    let response = state
        .promotion_service
        .deliver_promotion(&ctx, &body.promotion_id, user_id)
        .await
        .map_err(service_error)?;
    Ok(ok_json(response))
}

/// `POST /app/v3/api/search/events` — 记录用户事件。
#[derive(Deserialize, Serialize)]
#[serde(rename_all = "camelCase")]
pub(crate) struct SearchUserEventBody {
    event_type: String,
    index_id: Option<String>,
    document_id: Option<String>,
    query_text: Option<String>,
    result_position: Option<u32>,
    metadata: Option<serde_json::Value>,
}

pub(crate) async fn create_search_user_event(
    State(state): State<SearchAppState>,
    Json(body): Json<SearchUserEventBody>,
) -> HandlerResult {
    let ctx = provider_context();
    let payload = serde_json::to_value(&body).unwrap_or_default();
    state
        .query_service
        .record_user_event(&ctx, &body.event_type, &payload)
        .await
        .map_err(service_error)?;
    Ok(Json(json!({ "accepted": true })))
}

/// `GET /app/v3/api/search/recent_queries` — 列出最近查询记录。
#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
pub(crate) struct RecentQueriesParams {
    #[serde(default = "default_recent_limit", rename = "page_size")]
    page_size: u32,
}

fn default_recent_limit() -> u32 {
    10
}

pub(crate) async fn list_search_recent_queries(
    State(state): State<SearchAppState>,
    Query(params): Query<RecentQueriesParams>,
) -> HandlerResult {
    let ctx = provider_context();
    let queries = state
        .query_service
        .list_recent_queries(&ctx, params.page_size)
        .await
        .map_err(service_error)?;
    Ok(Json(json!({ "queries": queries })))
}

/// `POST /app/v3/api/search/semantic_queries` — 执行一次语义搜索。
pub(crate) async fn create_search_semantic_query(
    State(state): State<SearchAppState>,
    Json(mut body): Json<SemanticSearchQuery>,
) -> HandlerResult {
    let ctx = provider_context();
    body.tenant_id = ctx.tenant_id;
    body.organization_id = ctx.organization_id;
    let response = state
        .query_service
        .execute_semantic(&ctx, body)
        .await
        .map_err(service_error)?;
    Ok(ok_json(response))
}
