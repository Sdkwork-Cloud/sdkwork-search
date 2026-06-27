//! Recommendation service - strategy-based recommendation orchestration.

use std::collections::HashMap;
use std::sync::Arc;
use std::time::Instant;

use sdkwork_search_provider_spi::{SearchProviderContext, SearchProviderRegistry, SearchQuery};
use tracing::debug;

use crate::domain::{RecommendationItem, RecommendationResponse, RecommendationStrategyType};
use crate::error::{RecommendationServiceError, RecommendationServiceResult};
use crate::ports::RecommendationRepositoryPort;

/// Hybrid 融合权重：trending 0.3, content_based 0.3, collaborative_filtering 0.4。
const HYBRID_WEIGHT_TRENDING: f64 = 0.3;
const HYBRID_WEIGHT_CONTENT: f64 = 0.3;
const HYBRID_WEIGHT_COLLABORATIVE: f64 = 0.4;

/// 个人化重排时，命中用户近期浏览文档的偏好加权系数。
const PERSONALIZED_PREF_BOOST: f64 = 1.2;

/// Orchestrates recommendations across strategies, combining provider search with user event
/// history from the repository.
pub struct RecommendationService {
    provider_registry: Arc<SearchProviderRegistry>,
    repository: Arc<dyn RecommendationRepositoryPort>,
}

impl RecommendationService {
    pub fn new(
        provider_registry: Arc<SearchProviderRegistry>,
        repository: Arc<dyn RecommendationRepositoryPort>,
    ) -> Self {
        Self {
            provider_registry,
            repository,
        }
    }

    /// Produce recommendations for the given strategy, user, and index.
    pub async fn recommend(
        &self,
        ctx: &SearchProviderContext,
        strategy: RecommendationStrategyType,
        user_id: i64,
        index_key: &str,
        limit: u32,
    ) -> RecommendationServiceResult<RecommendationResponse> {
        let started = Instant::now();
        debug!(?strategy, %index_key, user_id, "computing recommendations");

        let items = match strategy {
            RecommendationStrategyType::Trending => self
                .repository
                .get_trending(ctx, index_key, limit)
                .await
                .map_err(RecommendationServiceError::Repository)?,
            RecommendationStrategyType::ContentBased => {
                self.content_based_items(ctx, user_id, index_key, limit)
                    .await?
            }
            RecommendationStrategyType::CollaborativeFiltering => {
                self.collaborative_filtering_items(ctx, user_id, index_key, limit)
                    .await?
            }
            RecommendationStrategyType::Personalized => {
                self.personalized_items(ctx, user_id, index_key, limit)
                    .await?
            }
            RecommendationStrategyType::Hybrid => {
                self.hybrid_items(ctx, user_id, index_key, limit).await?
            }
        };

        self.repository
            .record_recommendation(ctx, user_id, &items)
            .await
            .map_err(RecommendationServiceError::Repository)?;

        let took_ms = started.elapsed().as_millis() as u64;
        Ok(RecommendationResponse {
            items,
            strategy,
            took_ms,
        })
    }

    /// List the supported recommendation strategies.
    pub async fn list_strategies(
        &self,
        _ctx: &SearchProviderContext,
    ) -> RecommendationServiceResult<Vec<RecommendationStrategyType>> {
        Ok(vec![
            RecommendationStrategyType::CollaborativeFiltering,
            RecommendationStrategyType::ContentBased,
            RecommendationStrategyType::Hybrid,
            RecommendationStrategyType::Trending,
            RecommendationStrategyType::Personalized,
        ])
    }

    /// Derive content-based recommendations from the user profile via provider search.
    async fn content_based_items(
        &self,
        ctx: &SearchProviderContext,
        user_id: i64,
        index_key: &str,
        limit: u32,
    ) -> RecommendationServiceResult<Vec<RecommendationItem>> {
        let profile = self
            .repository
            .get_user_profile(ctx, user_id)
            .await
            .map_err(RecommendationServiceError::Repository)?;
        let query_text = profile
            .as_ref()
            .and_then(|p| p.get("preferred_query"))
            .and_then(|v| v.as_str())
            .unwrap_or("")
            .to_string();

        let query = SearchQuery {
            tenant_id: ctx.tenant_id,
            organization_id: ctx.organization_id,
            index_key: index_key.to_string(),
            query_text,
            filters: HashMap::new(),
            facets: Vec::new(),
            page: 1,
            page_size: limit,
            sort: Vec::new(),
            highlight: None,
            min_score: None,
            timeout_ms: None,
        };
        let response = self.provider_registry.search(ctx, &query).await?;
        let items = response
            .hits
            .into_iter()
            .map(|hit| RecommendationItem {
                document_id: hit.document_id,
                score: hit.score,
                source: hit.source,
                reason: Some("content-based".to_string()),
            })
            .collect();
        Ok(items)
    }

    /// item-based 协同过滤推荐：基于用户已交互文档找到相似文档。
    ///
    /// 流程：获取用户事件 → 提取 document_id → 查找共享用户行为的相似文档。
    /// 冷启动（无历史事件）或无相似文档时 fallback 到 Trending。
    async fn collaborative_filtering_items(
        &self,
        ctx: &SearchProviderContext,
        user_id: i64,
        index_key: &str,
        limit: u32,
    ) -> RecommendationServiceResult<Vec<RecommendationItem>> {
        let events = self
            .repository
            .get_user_events(ctx, user_id, limit)
            .await
            .map_err(RecommendationServiceError::Repository)?;

        let document_ids: Vec<String> = events.into_iter().map(|e| e.document_id).collect();

        if document_ids.is_empty() {
            debug!(
                user_id,
                "collaborative_filtering cold start, falling back to trending"
            );
            return self
                .repository
                .get_trending(ctx, index_key, limit)
                .await
                .map_err(RecommendationServiceError::Repository);
        }

        let mut items = self
            .repository
            .get_similar_documents(ctx, index_key, &document_ids, limit)
            .await
            .map_err(RecommendationServiceError::Repository)?;

        if items.is_empty() {
            debug!(
                user_id,
                "collaborative_filtering no similar docs, falling back to trending"
            );
            items = self
                .repository
                .get_trending(ctx, index_key, limit)
                .await
                .map_err(RecommendationServiceError::Repository)?;
        }

        Ok(items)
    }

    /// 个性化推荐：基于用户画像与近期查询偏好进行搜索并重排。
    ///
    /// 流程：获取用户画像 → 取近期查询作为 preferred_query → 执行搜索 → 按用户偏好重排。
    /// 冷启动（无画像或无查询）时 fallback 到 Trending。
    async fn personalized_items(
        &self,
        ctx: &SearchProviderContext,
        user_id: i64,
        index_key: &str,
        limit: u32,
    ) -> RecommendationServiceResult<Vec<RecommendationItem>> {
        let profile = self
            .repository
            .get_user_profile(ctx, user_id)
            .await
            .map_err(RecommendationServiceError::Repository)?;

        let profile = match profile {
            Some(p) => p,
            None => {
                debug!(
                    user_id,
                    "personalized cold start (no profile), falling back to trending"
                );
                return self
                    .repository
                    .get_trending(ctx, index_key, limit)
                    .await
                    .map_err(RecommendationServiceError::Repository);
            }
        };

        // 取用户最近一次查询作为偏好查询词。
        let query_text = profile
            .get("recent_queries")
            .and_then(|v| v.as_array())
            .and_then(|arr| arr.first())
            .and_then(|v| v.as_str())
            .unwrap_or("")
            .to_string();

        if query_text.is_empty() {
            debug!(
                user_id,
                "personalized no recent query, falling back to trending"
            );
            return self
                .repository
                .get_trending(ctx, index_key, limit)
                .await
                .map_err(RecommendationServiceError::Repository);
        }

        let query = SearchQuery {
            tenant_id: ctx.tenant_id,
            organization_id: ctx.organization_id,
            index_key: index_key.to_string(),
            query_text,
            filters: HashMap::new(),
            facets: Vec::new(),
            page: 1,
            page_size: limit,
            sort: Vec::new(),
            highlight: None,
            min_score: None,
            timeout_ms: None,
        };
        let response = self.provider_registry.search(ctx, &query).await?;

        // 用户近期浏览过的文档作为偏好信号，命中则加权（偏好重排）。
        let recent_documents: Vec<String> = profile
            .get("recent_documents")
            .and_then(|v| v.as_array())
            .map(|arr| {
                arr.iter()
                    .filter_map(|v| v.as_str().map(|s| s.to_string()))
                    .collect()
            })
            .unwrap_or_default();

        let mut items: Vec<RecommendationItem> = response
            .hits
            .into_iter()
            .map(|hit| {
                let mut score = hit.score;
                if recent_documents.iter().any(|d| d == &hit.document_id) {
                    score *= PERSONALIZED_PREF_BOOST;
                }
                RecommendationItem {
                    document_id: hit.document_id,
                    score,
                    source: hit.source,
                    reason: Some("personalized".to_string()),
                }
            })
            .collect();

        // 按调整后分数降序重排，截取 limit。
        items.sort_by(|a, b| {
            b.score
                .partial_cmp(&a.score)
                .unwrap_or(std::cmp::Ordering::Equal)
        });
        items.truncate(limit as usize);

        Ok(items)
    }

    /// 混合推荐：融合 Trending + ContentBased + CollaborativeFiltering。
    ///
    /// 分别执行三种策略，对各自分数归一化后按权重加权平均，返回融合重排结果。
    async fn hybrid_items(
        &self,
        ctx: &SearchProviderContext,
        user_id: i64,
        index_key: &str,
        limit: u32,
    ) -> RecommendationServiceResult<Vec<RecommendationItem>> {
        let trending = self
            .repository
            .get_trending(ctx, index_key, limit)
            .await
            .map_err(RecommendationServiceError::Repository)?;
        let content = self
            .content_based_items(ctx, user_id, index_key, limit)
            .await?;
        let collaborative = self
            .collaborative_filtering_items(ctx, user_id, index_key, limit)
            .await?;

        debug!(
            user_id,
            trending_n = trending.len(),
            content_n = content.len(),
            collaborative_n = collaborative.len(),
            "hybrid fusing strategies"
        );

        let mut fused = normalize_and_fuse(vec![
            (trending, HYBRID_WEIGHT_TRENDING),
            (content, HYBRID_WEIGHT_CONTENT),
            (collaborative, HYBRID_WEIGHT_COLLABORATIVE),
        ]);
        fused.truncate(limit as usize);
        Ok(fused)
    }
}

/// 归一化各策略分数到 [0,1] 后按权重加权融合。
///
/// 每个文档的融合分数 = Σ(权重 × 归一化分数)。相同 document_id 跨策略累加，
/// 最终按融合分数降序排列。
fn normalize_and_fuse(strategies: Vec<(Vec<RecommendationItem>, f64)>) -> Vec<RecommendationItem> {
    let mut scores: HashMap<String, f64> = HashMap::new();
    let mut sources: HashMap<String, serde_json::Value> = HashMap::new();

    for (items, weight) in strategies {
        let max = items.iter().map(|i| i.score).fold(0.0_f64, f64::max);
        let norm = if max > 0.0 { 1.0 / max } else { 0.0 };
        for item in items {
            let weighted = item.score * norm * weight;
            *scores.entry(item.document_id.clone()).or_insert(0.0) += weighted;
            sources
                .entry(item.document_id.clone())
                .or_insert(item.source);
        }
    }

    let mut fused: Vec<RecommendationItem> = scores
        .into_iter()
        .map(|(document_id, score)| RecommendationItem {
            source: sources
                .remove(&document_id)
                .unwrap_or(serde_json::Value::Null),
            document_id: document_id.clone(),
            score,
            reason: Some("hybrid".to_string()),
        })
        .collect();
    fused.sort_by(|a, b| {
        b.score
            .partial_cmp(&a.score)
            .unwrap_or(std::cmp::Ordering::Equal)
    });
    fused
}
