//! `SearchSuggestionRepository` - SQLx repository for `search_query_suggestion`.
//!
//! Backed by `pg_trgm` similarity for prefix-aware suggestion matching.

use sqlx::PgPool;
use uuid::Uuid;

use crate::db::rows::SearchSuggestionRow;
use crate::error::RepositoryResult;
use crate::repository::queries;

/// SQLx repository for the `search_query_suggestion` table.
pub struct SearchSuggestionRepository {
    pool: PgPool,
}

impl SearchSuggestionRepository {
    pub fn new(pool: PgPool) -> Self {
        Self { pool }
    }

    /// Lists suggestions whose `suggestion_text` is similar to `prefix`, ordered
    /// by `pg_trgm` similarity descending.
    pub async fn list_suggestions(
        &self,
        tenant_id: i64,
        organization_id: i64,
        index_key: &str,
        prefix: &str,
        limit: u32,
    ) -> RepositoryResult<Vec<SearchSuggestionRow>> {
        sqlx::query_as::<sqlx::Postgres, SearchSuggestionRow>(queries::SUGGESTION_LIST)
            .bind(tenant_id)
            .bind(organization_id)
            .bind(index_key)
            .bind(prefix)
            .bind(limit as i64)
            .fetch_all(&self.pool)
            .await
            .map_err(Into::into)
    }

    /// Inserts a new suggestion or, on conflict, increments its popularity score.
    ///
    /// `id` is provided by the caller (snowflake-style); it is only used when a
    /// new row is inserted.
    pub async fn upsert_suggestion(
        &self,
        id: i64,
        tenant_id: i64,
        organization_id: i64,
        index_key: &str,
        suggestion_text: &str,
    ) -> RepositoryResult<SearchSuggestionRow> {
        let uuid = Uuid::new_v4().to_string();
        sqlx::query_as::<sqlx::Postgres, SearchSuggestionRow>(queries::SUGGESTION_UPSERT)
            .bind(id)
            .bind(uuid)
            .bind(tenant_id)
            .bind(organization_id)
            .bind(index_key)
            .bind(suggestion_text)
            .fetch_one(&self.pool)
            .await
            .map_err(Into::into)
    }

    /// Increments the popularity score of a suggestion by `id`.
    pub async fn increment_popularity(
        &self,
        tenant_id: i64,
        organization_id: i64,
        suggestion_id: i64,
    ) -> RepositoryResult<()> {
        sqlx::query(queries::SUGGESTION_INCREMENT_POPULARITY)
            .bind(suggestion_id)
            .bind(tenant_id)
            .bind(organization_id)
            .execute(&self.pool)
            .await
            .map(|_| ())
            .map_err(Into::into)
    }

    /// Returns the underlying PostgreSQL pool.
    pub fn pool(&self) -> &PgPool {
        &self.pool
    }
}
