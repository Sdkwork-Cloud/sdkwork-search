//! Promotion service domain models.

use std::collections::HashMap;

use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};

/// Placement of a promotion within search results.
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "lowercase")]
pub enum PromotionPlacement {
    Top,
    Inline,
    Banner,
    Sidebar,
}

/// Targeting descriptor for a promotion.
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct PromotionTarget {
    pub index_key: String,
    pub placement: PromotionPlacement,
    #[serde(default)]
    pub filters: HashMap<String, Vec<String>>,
}

/// A rule governing promotion matching and priority.
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct PromotionRule {
    pub rule_id: String,
    pub priority: u32,
    pub target: PromotionTarget,
    pub condition: serde_json::Value,
}

/// A configured promotion.
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Promotion {
    pub promotion_id: String,
    pub title: String,
    pub target: PromotionTarget,
    pub rules: Vec<PromotionRule>,
    pub start_at: Option<DateTime<Utc>>,
    pub end_at: Option<DateTime<Utc>>,
    pub enabled: bool,
}

/// Record of a promotion delivered to a user.
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct PromotionDelivery {
    pub promotion_id: String,
    pub user_id: i64,
    pub delivered_at: DateTime<Utc>,
    pub placement: PromotionPlacement,
}

/// 创建推广的输入参数。
///
/// 调用方提供推广标识、投放位置、关联索引与文档、优先级与匹配规则；
/// `tenant_id`/`organization_id` 由 `SearchProviderContext` 携带，不在此结构体中。
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct CreatePromotionInput {
    pub promotion_key: String,
    pub placement: PromotionPlacement,
    pub index_key: String,
    pub document_id: String,
    pub priority: i32,
    pub rules: Vec<PromotionRule>,
    pub enabled: bool,
    pub start_at: Option<DateTime<Utc>>,
    pub end_at: Option<DateTime<Utc>>,
}

/// 更新推广的字段补丁。
///
/// 所有字段为 `Option`，`None` 表示保留原值。`enabled` 映射到 `status` 列
/// （`true` → `1`，`false` → `0`）。
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct UpdatePromotionInput {
    pub placement: Option<PromotionPlacement>,
    pub document_id: Option<String>,
    pub priority: Option<i32>,
    pub rules: Option<Vec<PromotionRule>>,
    pub enabled: Option<bool>,
    pub start_at: Option<DateTime<Utc>>,
    pub end_at: Option<DateTime<Utc>>,
}
