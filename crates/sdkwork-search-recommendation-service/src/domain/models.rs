//! Recommendation service domain models.

use serde::{Deserialize, Serialize};

/// Supported recommendation strategy types.
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum RecommendationStrategyType {
    CollaborativeFiltering,
    ContentBased,
    Hybrid,
    Trending,
    Personalized,
}

/// Inbound recommendation request DTO.
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct RecommendationRequest {
    pub user_id: i64,
    pub index_key: String,
    pub strategy: RecommendationStrategyType,
    pub limit: u32,
}

/// A single recommended item.
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct RecommendationItem {
    pub document_id: String,
    pub score: f64,
    pub source: serde_json::Value,
    pub reason: Option<String>,
}

/// Recommendation response containing the ranked items.
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct RecommendationResponse {
    pub items: Vec<RecommendationItem>,
    pub strategy: RecommendationStrategyType,
    pub took_ms: u64,
}
