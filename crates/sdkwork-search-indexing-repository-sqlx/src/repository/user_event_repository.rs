//! `SearchUserEventRepository` - SQLx repository for `search_user_event` and
//! `search_recent_query`.
//!
//! Records user interaction events and exposes recent-query history per user.

use sdkwork_search_recommendation_service::domain::RecommendationItem;
use sqlx::PgPool;
use uuid::Uuid;

use crate::db::rows::{
    SearchRecentQueryRow, SearchSimilarDocumentRow, SearchTrendingRow, SearchUserEventRow,
};
use crate::error::RepositoryResult;
use crate::repository::queries;

/// Inputs for recording a search user event.
#[derive(Debug, Clone)]
pub struct RecordUserEventParams {
    pub id: i64,
    pub tenant_id: i64,
    pub organization_id: i64,
    pub user_id: i64,
    pub event_type: String,
    pub surface: String,
    pub index_key: Option<String>,
    pub document_id: Option<String>,
    pub placement: Option<String>,
    pub q: Option<String>,
    pub result_position: Option<i32>,
    pub request_id: Option<String>,
    pub metadata_json: serde_json::Value,
}

/// Inputs for upserting a recent search query for a user.
#[derive(Debug, Clone)]
pub struct UpsertRecentQueryParams<'a> {
    pub id: i64,
    pub tenant_id: i64,
    pub organization_id: i64,
    pub user_id: i64,
    pub index_key: &'a str,
    pub q: &'a str,
    pub result_count: i32,
}

/// SQLx repository for `search_user_event` and `search_recent_query`.
pub struct SearchUserEventRepository {
    pool: PgPool,
}

impl SearchUserEventRepository {
    pub fn new(pool: PgPool) -> Self {
        Self { pool }
    }

    /// Records a user interaction event.
    pub async fn record_event(
        &self,
        params: &RecordUserEventParams,
    ) -> RepositoryResult<SearchUserEventRow> {
        let uuid = Uuid::new_v4().to_string();
        sqlx::query_as::<sqlx::Postgres, SearchUserEventRow>(queries::USER_EVENT_RECORD)
            .bind(params.id)
            .bind(uuid)
            .bind(params.tenant_id)
            .bind(params.organization_id)
            .bind(params.user_id)
            .bind(&params.event_type)
            .bind(&params.surface)
            .bind(params.index_key.as_deref())
            .bind(params.document_id.as_deref())
            .bind(params.placement.as_deref())
            .bind(params.q.as_deref())
            .bind(params.result_position)
            .bind(params.request_id.as_deref())
            .bind(&params.metadata_json)
            .fetch_one(&self.pool)
            .await
            .map_err(Into::into)
    }

    /// Upserts a recent query for a user (re-bumps `last_used_at` on conflict).
    pub async fn upsert_recent_query(
        &self,
        params: &UpsertRecentQueryParams<'_>,
    ) -> RepositoryResult<SearchRecentQueryRow> {
        let uuid = Uuid::new_v4().to_string();
        sqlx::query_as::<sqlx::Postgres, SearchRecentQueryRow>(queries::RECENT_QUERY_UPSERT)
            .bind(params.id)
            .bind(uuid)
            .bind(params.tenant_id)
            .bind(params.organization_id)
            .bind(params.user_id)
            .bind(params.index_key)
            .bind(params.q)
            .bind(params.result_count)
            .fetch_one(&self.pool)
            .await
            .map_err(Into::into)
    }

    /// Lists recent queries for a user, newest first.
    pub async fn list_recent_queries(
        &self,
        tenant_id: i64,
        organization_id: i64,
        user_id: i64,
        limit: u32,
    ) -> RepositoryResult<Vec<SearchRecentQueryRow>> {
        sqlx::query_as::<sqlx::Postgres, SearchRecentQueryRow>(queries::RECENT_QUERY_LIST)
            .bind(tenant_id)
            .bind(organization_id)
            .bind(user_id)
            .bind(limit as i64)
            .fetch_all(&self.pool)
            .await
            .map_err(Into::into)
    }

    /// 列出指定用户的事件流，按 `occurred_at` 倒序。
    ///
    /// `event_type` 为 `None` 时返回全部事件类型；租户隔离由 `tenant_id` +
    /// `organization_id` 过滤保证。
    pub async fn list_user_events(
        &self,
        tenant_id: i64,
        organization_id: i64,
        user_id: i64,
        event_type: Option<&str>,
        limit: u32,
    ) -> RepositoryResult<Vec<SearchUserEventRow>> {
        sqlx::query_as::<sqlx::Postgres, SearchUserEventRow>(queries::USER_EVENT_LIST_BY_USER)
            .bind(tenant_id)
            .bind(organization_id)
            .bind(user_id)
            .bind(event_type)
            .bind(limit as i64)
            .fetch_all(&self.pool)
            .await
            .map_err(Into::into)
    }

    /// 聚合指定 `index_key` 下的热门文档（基于 `view`/`click` 事件计数）。
    pub async fn get_trending(
        &self,
        tenant_id: i64,
        organization_id: i64,
        index_key: &str,
        limit: u32,
    ) -> RepositoryResult<Vec<SearchTrendingRow>> {
        sqlx::query_as::<sqlx::Postgres, SearchTrendingRow>(queries::USER_EVENT_TRENDING)
            .bind(tenant_id)
            .bind(organization_id)
            .bind(index_key)
            .bind(limit as i64)
            .fetch_all(&self.pool)
            .await
            .map_err(Into::into)
    }

    /// item-based 协同过滤：查找与指定文档有共同用户行为的相似文档。
    ///
    /// 返回与 `document_ids` 共享用户（`view`/`click`）的其他文档，按共同用户数降序。
    /// 排除用户已交互的文档；租户隔离由 `tenant_id` + `organization_id` 过滤保证。
    /// `document_ids` 为空时返回空结果。
    pub async fn get_similar_documents(
        &self,
        tenant_id: i64,
        organization_id: i64,
        index_key: &str,
        document_ids: &[String],
        limit: u32,
    ) -> RepositoryResult<Vec<SearchSimilarDocumentRow>> {
        if document_ids.is_empty() {
            return Ok(Vec::new());
        }
        sqlx::query_as::<sqlx::Postgres, SearchSimilarDocumentRow>(
            queries::USER_EVENT_SIMILAR_DOCUMENTS,
        )
        .bind(tenant_id)
        .bind(organization_id)
        .bind(index_key)
        .bind(document_ids)
        .bind(limit as i64)
        .fetch_all(&self.pool)
        .await
        .map_err(Into::into)
    }

    /// 聚合用户最近事件为 JSON profile。
    ///
    /// 当用户没有任何事件时返回 `None`；否则返回包含事件类型计数、近期文档与查询的 JSON。
    pub async fn get_user_profile(
        &self,
        tenant_id: i64,
        organization_id: i64,
        user_id: i64,
    ) -> RepositoryResult<Option<serde_json::Value>> {
        let events = self
            .list_user_events(tenant_id, organization_id, user_id, None, 100)
            .await?;
        if events.is_empty() {
            return Ok(None);
        }

        let mut event_counts: std::collections::BTreeMap<&str, i64> =
            std::collections::BTreeMap::new();
        let mut recent_documents: Vec<&str> = Vec::new();
        let mut recent_queries: Vec<&str> = Vec::new();

        for event in &events {
            *event_counts.entry(event.event_type.as_str()).or_insert(0) += 1;
            if let Some(doc) = event.document_id.as_deref() {
                if !doc.is_empty() && !recent_documents.contains(&doc) {
                    recent_documents.push(doc);
                }
            }
            if let Some(q) = event.q.as_deref() {
                if !q.is_empty() && !recent_queries.contains(&q) {
                    recent_queries.push(q);
                }
            }
        }

        let profile = serde_json::json!({
            "user_id": user_id,
            "event_counts": event_counts,
            "recent_documents": recent_documents,
            "recent_queries": recent_queries,
        });
        Ok(Some(profile))
    }

    /// 记录推荐投递：为每个推荐项写入一条 `search_user_event`（`event_type='recommendation'`）。
    ///
    /// `metadata_json` 携带该项的 `score`/`source`/`reason`，便于后续分析。
    pub async fn record_recommendation(
        &self,
        tenant_id: i64,
        organization_id: i64,
        user_id: i64,
        items: &[RecommendationItem],
    ) -> RepositoryResult<()> {
        for (index, item) in items.iter().enumerate() {
            let metadata = serde_json::json!({
                "score": item.score,
                "source": item.source,
                "reason": item.reason,
            });
            let id = chrono::Utc::now().timestamp_millis() + index as i64;
            let uuid = Uuid::new_v4().to_string();
            // bind 顺序与 USER_EVENT_RECORD 一致：id, uuid, tenant_id, organization_id,
            // user_id, event_type, surface, index_key, document_id, placement, q,
            // result_position, request_id, metadata_json
            sqlx::query(queries::USER_EVENT_RECORD)
                .bind(id)
                .bind(uuid)
                .bind(tenant_id)
                .bind(organization_id)
                .bind(user_id)
                .bind("recommendation")
                .bind("recommendation")
                .bind(None::<&str>)
                .bind(&item.document_id)
                .bind(None::<&str>)
                .bind(None::<&str>)
                .bind(None::<i32>)
                .bind(None::<&str>)
                .bind(&metadata)
                .execute(&self.pool)
                .await?;
        }
        Ok(())
    }

    /// Returns the underlying PostgreSQL pool.
    pub fn pool(&self) -> &PgPool {
        &self.pool
    }
}
