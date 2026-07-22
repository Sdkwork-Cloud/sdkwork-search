//! Search query and response models shared across providers.
//!
//! 客户端契约遵循行业惯例（Algolia / Meilisearch / Elasticsearch）：
//! - 字段名使用 camelCase（`#[serde(rename_all = "camelCase")]`）
//! - 查询文本字段在 JSON 中命名为 `q`（与 Algolia/Meilisearch 一致）
//! - `tenantId` / `organizationId` 由服务端从认证上下文注入，客户端不发送（`#[serde(skip)]`）

use serde::{Deserialize, Serialize};
use std::collections::HashMap;

/// 搜索查询请求。
///
/// 客户端只需发送 `indexKey`、`q`、分页与高级字段；租户/组织上下文由
/// `SearchProviderContext` 在服务端注入，对客户端透明。
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct SearchQuery {
    /// 租户 ID（服务端注入，客户端无需发送）。
    #[serde(skip)]
    pub tenant_id: i64,
    /// 组织 ID（服务端注入，客户端无需发送）。
    #[serde(skip)]
    pub organization_id: i64,
    /// 目标索引 key（必填）。
    pub index_key: String,
    /// 查询文本，JSON 字段名为 `q`，对齐 Algolia/Meilisearch 命名。
    #[serde(rename = "q")]
    pub query_text: String,
    /// 当前页码，从 1 开始。
    #[serde(default = "default_page")]
    pub page: u32,
    /// 每页大小。
    #[serde(default = "default_page_size")]
    pub page_size: u32,
    /// 结构化过滤条件：`field -> [value1, value2, ...]`。
    #[serde(default)]
    pub filters: HashMap<String, Vec<String>>,
    /// 需要 facet 聚合的字段名列表。
    #[serde(default)]
    pub facets: Vec<String>,
    /// 排序子句列表。
    #[serde(default)]
    pub sort: Vec<SortClause>,
    /// 高亮配置；为 `None` 时不返回高亮片段。
    #[serde(default)]
    pub highlight: Option<HighlightConfig>,
    /// 命中最低分数阈值，低于此值的命中会被过滤。
    #[serde(default)]
    pub min_score: Option<f64>,
    /// 查询超时（毫秒），超时后返回已收集的部分结果。
    #[serde(default)]
    pub timeout_ms: Option<u64>,
}

fn default_page() -> u32 {
    1
}
fn default_page_size() -> u32 {
    20
}

/// 排序子句。
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct SortClause {
    /// 排序字段名（必须是合法标识符：字母数字 + 下划线）。
    pub field: String,
    /// 排序方向。
    pub order: SortOrder,
}

/// 排序方向。
#[derive(Debug, Clone, Copy, Serialize, Deserialize, PartialEq, Eq)]
#[serde(rename_all = "lowercase")]
pub enum SortOrder {
    Asc,
    Desc,
}

/// 高亮配置。
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct HighlightConfig {
    /// 需要高亮的字段列表。
    pub fields: Vec<String>,
    /// 高亮片段前缀标记，默认 `<em>`。
    pub pre_tag: Option<String>,
    /// 高亮片段后缀标记，默认 `</em>`。
    pub post_tag: Option<String>,
    /// 每个高亮片段的最大词数。
    pub fragment_size: Option<u32>,
    /// 每个字段最多返回的片段数。
    pub max_fragments: Option<u32>,
}

/// 搜索响应。
///
/// 扁平结构（`hits` + `total` + `facets`），对齐 Algolia / Meilisearch /
/// Elasticsearch 的行业标准。
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct SearchResponse {
    /// 匹配查询的真实总数（不受分页影响）。
    pub total: u64,
    /// 当前页的命中列表。
    pub hits: Vec<SearchHit>,
    /// facet 字段聚合结果：`field -> [bucket]`。
    #[serde(default)]
    pub facets: HashMap<String, Vec<FacetBucket>>,
    /// 查询耗时（毫秒）。
    pub took_ms: u64,
    /// 当前结果集的最大分数（若无命中则为 `null`）。
    #[serde(default)]
    pub max_score: Option<f64>,
    /// 服务端请求 ID，用于问题追踪。
    #[serde(default)]
    pub request_id: Option<String>,
}

/// 单条搜索命中。
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct SearchHit {
    /// 文档 ID。
    pub document_id: String,
    /// 相关性分数（越高越相关）。
    pub score: f64,
    /// 文档原始数据（包含 title 等字段）。
    #[serde(default)]
    pub source: serde_json::Value,
    /// 高亮片段：`field -> [snippet]`。
    #[serde(default)]
    pub highlight: HashMap<String, Vec<String>>,
    /// 命中文档所属的索引 key（跨索引搜索时使用）。
    #[serde(default)]
    pub index_key: Option<String>,
}

/// facet 字段聚合描述（内部使用）。
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct SearchFacet {
    pub field: String,
    pub buckets: Vec<FacetBucket>,
}

/// facet 桶。
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct FacetBucket {
    /// 桶值。
    pub value: String,
    /// 该值在结果集中的出现次数。
    pub count: u64,
}

/// 搜索补全查询。
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct SearchSuggestionQuery {
    #[serde(skip)]
    pub tenant_id: i64,
    #[serde(skip)]
    pub organization_id: i64,
    pub index_key: String,
    pub prefix: String,
    #[serde(default = "default_suggestion_page_size", rename = "page_size")]
    pub page_size: u32,
    #[serde(default)]
    pub filters: HashMap<String, Vec<String>>,
}

fn default_suggestion_page_size() -> u32 {
    10
}

impl Default for SearchSuggestionQuery {
    fn default() -> Self {
        Self {
            tenant_id: 0,
            organization_id: 0,
            index_key: String::new(),
            prefix: String::new(),
            page_size: 10,
            filters: HashMap::new(),
        }
    }
}

/// 搜索补全响应。
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct SearchSuggestionResponse {
    pub suggestions: Vec<SearchSuggestion>,
    pub took_ms: u64,
}

/// 单条搜索补全建议。
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct SearchSuggestion {
    pub text: String,
    pub score: f64,
    #[serde(default)]
    pub payload: Option<serde_json::Value>,
}

/// 语义搜索查询。
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct SemanticSearchQuery {
    #[serde(skip)]
    pub tenant_id: i64,
    #[serde(skip)]
    pub organization_id: i64,
    pub index_key: String,
    #[serde(rename = "q")]
    pub query_text: String,
    #[serde(default)]
    pub query_embedding: Vec<f32>,
    #[serde(default = "default_top_k")]
    pub top_k: u32,
    #[serde(default)]
    pub filters: HashMap<String, Vec<String>>,
    #[serde(default)]
    pub min_score: Option<f32>,
    #[serde(default)]
    pub timeout_ms: Option<u64>,
}

fn default_top_k() -> u32 {
    10
}

impl Default for SemanticSearchQuery {
    fn default() -> Self {
        Self {
            tenant_id: 0,
            organization_id: 0,
            index_key: String::new(),
            query_text: String::new(),
            query_embedding: Vec::new(),
            top_k: 10,
            filters: HashMap::new(),
            min_score: None,
            timeout_ms: None,
        }
    }
}

/// 语义搜索响应。
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct SemanticSearchResponse {
    pub hits: Vec<SemanticSearchHit>,
    pub took_ms: u64,
}

/// 单条语义搜索命中。
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct SemanticSearchHit {
    pub document_id: String,
    pub score: f32,
    #[serde(default)]
    pub source: serde_json::Value,
}
