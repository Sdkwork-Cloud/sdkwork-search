//! `SearchPromotionRepository` - SQLx repository for the `search_promotion` aggregate.
//!
//! 管理推广配置的读取与写入；推广曝光/点击事件复用 `search_user_event` 表，
//! 以 `event_type` 区分 `promotion_delivery`/`promotion_click`，便于后续聚合统计。

use chrono::{DateTime, Utc};
use serde_json::Value;
use sqlx::PgPool;
use uuid::Uuid;

use crate::db::rows::SearchPromotionRow;
use crate::error::RepositoryResult;
use crate::repository::queries;

/// 创建推广的输入参数。
#[derive(Debug, Clone)]
pub struct CreatePromotionParams {
    pub id: i64,
    pub tenant_id: i64,
    pub organization_id: i64,
    pub promotion_key: String,
    pub placement: String,
    pub index_key: String,
    pub document_id: String,
    pub priority: i32,
    pub rule_json: Value,
}

/// 推广曝光/点击的聚合统计行（仅用于内部查询，不对外暴露）。
#[derive(Debug, Clone, sqlx::FromRow)]
struct PromotionStatsRow {
    delivery_count: i64,
    click_count: i64,
}

/// SQLx repository for the `search_promotion` table.
pub struct SearchPromotionRepository {
    pool: PgPool,
}

impl SearchPromotionRepository {
    pub fn new(pool: PgPool) -> Self {
        Self { pool }
    }

    /// 列出指定 `index_key` + `placement` 下当前活跃的推广。
    ///
    /// `now` 用于判定 `active_from`/`active_until` 有效期窗口。租户隔离由
    /// `tenant_id` + `organization_id` 过滤保证（遵循 `RUST_CODE_SPEC.md` §6）。
    pub async fn list_active_promotions(
        &self,
        tenant_id: i64,
        organization_id: i64,
        index_key: &str,
        placement: &str,
        now: DateTime<Utc>,
    ) -> RepositoryResult<Vec<SearchPromotionRow>> {
        sqlx::query_as::<sqlx::Postgres, SearchPromotionRow>(queries::PROMOTION_LIST_ACTIVE)
            .bind(tenant_id)
            .bind(organization_id)
            .bind(index_key)
            .bind(placement)
            .bind(now)
            .fetch_all(&self.pool)
            .await
            .map_err(Into::into)
    }

    /// 创建一条推广记录并返回持久化行。
    pub async fn create_promotion(
        &self,
        params: &CreatePromotionParams,
    ) -> RepositoryResult<SearchPromotionRow> {
        let uuid = Uuid::new_v4().to_string();
        sqlx::query_as::<sqlx::Postgres, SearchPromotionRow>(queries::PROMOTION_CREATE)
            .bind(params.id)
            .bind(uuid)
            .bind(params.tenant_id)
            .bind(params.organization_id)
            .bind(&params.promotion_key)
            .bind(&params.placement)
            .bind(&params.index_key)
            .bind(&params.document_id)
            .bind(params.priority)
            .bind(&params.rule_json)
            .fetch_one(&self.pool)
            .await
            .map_err(Into::into)
    }

    /// 记录推广曝光：写入 `search_user_event`，`event_type='promotion_delivery'`。
    ///
    /// `document_id` 列复用为 `promotion_id` 以便后续聚合统计。`id` 由调用方传入。
    pub async fn record_delivery(
        &self,
        id: i64,
        tenant_id: i64,
        organization_id: i64,
        promotion_id: &str,
        user_id: i64,
    ) -> RepositoryResult<()> {
        self.record_promotion_event(
            id,
            tenant_id,
            organization_id,
            promotion_id,
            user_id,
            "promotion_delivery",
        )
        .await
    }

    /// 记录推广点击：写入 `search_user_event`，`event_type='promotion_click'`。
    pub async fn record_click(
        &self,
        id: i64,
        tenant_id: i64,
        organization_id: i64,
        promotion_id: &str,
        user_id: i64,
    ) -> RepositoryResult<()> {
        self.record_promotion_event(
            id,
            tenant_id,
            organization_id,
            promotion_id,
            user_id,
            "promotion_click",
        )
        .await
    }

    /// 聚合推广统计：返回包含 `delivery_count`/`click_count` 的 JSON 对象。
    pub async fn get_promotion_stats(
        &self,
        tenant_id: i64,
        organization_id: i64,
        promotion_id: &str,
    ) -> RepositoryResult<Value> {
        let row: PromotionStatsRow =
            sqlx::query_as::<sqlx::Postgres, PromotionStatsRow>(queries::PROMOTION_STATS)
                .bind(tenant_id)
                .bind(organization_id)
                .bind(promotion_id)
                .fetch_one(&self.pool)
                .await?;
        Ok(serde_json::json!({
            "promotion_id": promotion_id,
            "delivery_count": row.delivery_count,
            "click_count": row.click_count,
        }))
    }

    /// Returns the underlying PostgreSQL pool.
    pub fn pool(&self) -> &PgPool {
        &self.pool
    }

    /// 写入推广事件的内部实现，由 `record_delivery`/`record_click` 复用。
    async fn record_promotion_event(
        &self,
        id: i64,
        tenant_id: i64,
        organization_id: i64,
        promotion_id: &str,
        user_id: i64,
        event_type: &str,
    ) -> RepositoryResult<()> {
        let uuid = Uuid::new_v4().to_string();
        sqlx::query(queries::PROMOTION_EVENT_INSERT)
            .bind(id)
            .bind(uuid)
            .bind(tenant_id)
            .bind(organization_id)
            .bind(user_id)
            .bind(event_type)
            .bind(promotion_id)
            .bind(serde_json::json!({}))
            .execute(&self.pool)
            .await
            .map(|_| ())
            .map_err(Into::into)
    }
}
