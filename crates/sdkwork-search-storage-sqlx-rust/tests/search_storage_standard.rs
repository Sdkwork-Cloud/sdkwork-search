use sdkwork_search_storage_sqlx::{
    search_management_tables, search_optional_postgresql_extension_names,
    search_postgresql_extension_names, search_recommendation_tables,
    search_database_tables, search_document_tables, search_initial_migration_sql,
    search_index_tables, search_operational_tables, search_storage_capability_manifest,
};

#[test]
fn exposes_search_table_catalog() {
    let tables = search_database_tables();

    for table in [
        "search_index",
        "search_document",
        "search_document_projection",
        "search_query_audit",
        "search_index_job",
        "search_synonym_set",
        "search_synonym_entry",
        "search_ranking_profile",
        "search_recommendation_strategy",
        "search_promotion",
        "search_user_event",
        "search_recent_query",
        "search_query_suggestion",
        "search_embedding_job",
        "search_provider_config",
        "search_provider_health_check",
        "search_ab_experiment",
        "search_ab_assignment",
    ] {
        assert!(tables.contains(&table), "missing search table: {table}");
    }

    for table in tables {
        assert!(
            table.starts_with("search_"),
            "search storage must expose only search-prefixed tables: {table}",
        );
        assert!(
            !table.starts_with("plus_"),
            "search storage must not add legacy plus-prefixed tables: {table}",
        );
    }
}

#[test]
fn splits_index_document_and_operational_tables() {
    assert_eq!(search_index_tables(), vec!["search_index"]);
    assert_eq!(
        search_document_tables(),
        vec!["search_document", "search_document_projection"],
    );
    assert_eq!(
        search_operational_tables(),
        vec![
            "search_query_audit",
            "search_index_job",
            "search_user_event",
            "search_recent_query",
            "search_embedding_job",
            "search_provider_health_check",
        ],
    );
    assert_eq!(
        search_management_tables(),
        vec![
            "search_provider_config",
            "search_synonym_set",
            "search_synonym_entry",
            "search_ranking_profile",
            "search_recommendation_strategy",
            "search_promotion",
            "search_query_suggestion",
        ],
    );
    assert_eq!(
        search_recommendation_tables(),
        vec!["search_ab_experiment", "search_ab_assignment"],
    );
}

#[test]
fn declares_postgresql_search_extensions() {
    assert_eq!(
        search_postgresql_extension_names(),
        vec!["pg_trgm"],
    );
    assert_eq!(
        search_optional_postgresql_extension_names(),
        vec!["vector"],
    );
}

#[test]
fn initial_migration_declares_search_tables_and_hot_path_indexes() {
    let sql = search_initial_migration_sql();

    for expected in [
        "CREATE TABLE IF NOT EXISTS search_index",
        "CREATE TABLE IF NOT EXISTS search_document",
        "CREATE TABLE IF NOT EXISTS search_document_projection",
        "CREATE TABLE IF NOT EXISTS search_query_audit",
        "CREATE TABLE IF NOT EXISTS search_index_job",
        "CREATE TABLE IF NOT EXISTS search_synonym_set",
        "CREATE TABLE IF NOT EXISTS search_synonym_entry",
        "CREATE TABLE IF NOT EXISTS search_ranking_profile",
        "CREATE TABLE IF NOT EXISTS search_recommendation_strategy",
        "CREATE TABLE IF NOT EXISTS search_promotion",
        "CREATE TABLE IF NOT EXISTS search_user_event",
        "CREATE TABLE IF NOT EXISTS search_recent_query",
        "CREATE TABLE IF NOT EXISTS search_query_suggestion",
        "CREATE TABLE IF NOT EXISTS search_embedding_job",
        "CREATE TABLE IF NOT EXISTS search_provider_config",
        "CREATE TABLE IF NOT EXISTS search_provider_health_check",
        "CREATE TABLE IF NOT EXISTS search_ab_experiment",
        "CREATE TABLE IF NOT EXISTS search_ab_assignment",
        "CREATE EXTENSION IF NOT EXISTS pg_trgm",
        "id BIGINT PRIMARY KEY",
        "uuid VARCHAR(64) NOT NULL UNIQUE",
        "tenant_id BIGINT NOT NULL DEFAULT 0",
        "organization_id BIGINT NOT NULL DEFAULT 0",
        "created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP",
        "updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP",
        "document_id VARCHAR(160) NOT NULL",
        "index_key VARCHAR(128) NOT NULL",
        "source_ref VARCHAR(512)",
        "title VARCHAR(512) NOT NULL",
        "body_text TEXT",
        "payload_json JSONB NOT NULL DEFAULT '{}'::jsonb",
        "token_json JSONB NOT NULL DEFAULT '[]'::jsonb",
        "search_vector TSVECTOR",
        "embedding_json JSONB NOT NULL DEFAULT '{}'::jsonb",
        "provider_key VARCHAR(128) NOT NULL",
        "provider_kind VARCHAR(64) NOT NULL",
        "capabilities_json JSONB NOT NULL DEFAULT '[]'::jsonb",
        "default_for_json JSONB NOT NULL DEFAULT '[]'::jsonb",
        "config_json JSONB NOT NULL DEFAULT '{}'::jsonb",
        "secret_config_ref VARCHAR(512)",
        "health_status VARCHAR(64) NOT NULL DEFAULT 'unknown'",
        "latency_ms INTEGER",
        "CREATE INDEX IF NOT EXISTS idx_search_document_search_vector",
        "CREATE INDEX IF NOT EXISTS idx_search_document_title_trgm",
        "CREATE INDEX IF NOT EXISTS idx_search_document_index_scope_updated",
        "CREATE INDEX IF NOT EXISTS idx_search_document_projection_index_group",
        "CREATE INDEX IF NOT EXISTS idx_search_query_audit_tenant_created",
        "CREATE INDEX IF NOT EXISTS idx_search_index_job_status_scheduled",
        "CREATE INDEX IF NOT EXISTS idx_search_promotion_placement_status",
        "CREATE INDEX IF NOT EXISTS idx_search_user_event_document_created",
        "CREATE INDEX IF NOT EXISTS idx_search_provider_config_kind_status",
        "CREATE INDEX IF NOT EXISTS idx_search_provider_health_provider_checked",
    ] {
        assert!(
            sql.contains(expected),
            "search migration must contain `{expected}`",
        );
    }
}

#[test]
fn manifest_declares_search_storage_contract() {
    let manifest = search_storage_capability_manifest();

    assert_eq!(manifest.name, "search-storage");
    assert_eq!(manifest.schema_version, "2026-06-06");
    assert_eq!(manifest.tables, search_database_tables());
    assert_eq!(manifest.index_tables, search_index_tables());
    assert_eq!(manifest.document_tables, search_document_tables());
    assert_eq!(manifest.operational_tables, search_operational_tables());
    assert_eq!(manifest.management_tables, search_management_tables());
    assert_eq!(manifest.recommendation_tables, search_recommendation_tables());
    assert_eq!(
        manifest.postgresql_extensions,
        search_postgresql_extension_names(),
    );
    assert_eq!(manifest.migrations, vec!["0001_search_storage.sql"]);
    assert!(manifest
        .repository_bindings
        .iter()
        .any(|binding| binding.repository_name == "SearchIndexRepository"));
    assert!(manifest
        .repository_bindings
        .iter()
        .any(|binding| binding.repository_name == "SearchDocumentRepository"));
    assert!(manifest
        .repository_bindings
        .iter()
        .any(|binding| binding.repository_name == "SearchRecommendationRepository"));
    assert!(manifest
        .repository_bindings
        .iter()
        .any(|binding| binding.repository_name == "SearchPromotionRepository"));
}
