pub const SEARCH_STORAGE_MIGRATION: &str = "0001_search_storage.sql";

mod bootstrap;

pub use bootstrap::{
    bootstrap_search_database, bootstrap_search_database_from_env,
    connect_and_bootstrap_search_database_from_env, connect_and_bootstrap_search_database_from_url,
    connect_search_database_pool_from_env, connect_search_database_pool_from_url,
    SearchDatabaseHost, SearchDatabasePool,
};

const SEARCH_INITIAL_MIGRATION_SQL: &str = include_str!("../migrations/0001_search_storage.sql");

#[derive(Clone, Debug, Eq, PartialEq)]
pub struct SearchRepositoryBinding {
    pub domain: &'static str,
    pub repository_name: &'static str,
    pub tables: Vec<&'static str>,
    pub requires_transaction: bool,
}

#[derive(Clone, Debug, Eq, PartialEq)]
pub struct SearchStorageCapabilityManifest {
    pub name: &'static str,
    pub schema_version: &'static str,
    pub tables: Vec<&'static str>,
    pub index_tables: Vec<&'static str>,
    pub document_tables: Vec<&'static str>,
    pub operational_tables: Vec<&'static str>,
    pub management_tables: Vec<&'static str>,
    pub recommendation_tables: Vec<&'static str>,
    pub postgresql_extensions: Vec<&'static str>,
    pub optional_postgresql_extensions: Vec<&'static str>,
    pub migrations: Vec<&'static str>,
    pub repository_bindings: Vec<SearchRepositoryBinding>,
}

pub fn search_index_tables() -> Vec<&'static str> {
    vec!["search_index"]
}

pub fn search_document_tables() -> Vec<&'static str> {
    vec!["search_document", "search_document_projection"]
}

pub fn search_operational_tables() -> Vec<&'static str> {
    vec![
        "search_query_audit",
        "search_index_job",
        "search_user_event",
        "search_recent_query",
        "search_embedding_job",
        "search_provider_health_check",
    ]
}

pub fn search_management_tables() -> Vec<&'static str> {
    vec![
        "search_provider_config",
        "search_synonym_set",
        "search_synonym_entry",
        "search_ranking_profile",
        "search_recommendation_strategy",
        "search_promotion",
        "search_query_suggestion",
    ]
}

pub fn search_recommendation_tables() -> Vec<&'static str> {
    vec!["search_ab_experiment", "search_ab_assignment"]
}

pub fn search_postgresql_extension_names() -> Vec<&'static str> {
    vec!["pg_trgm"]
}

pub fn search_optional_postgresql_extension_names() -> Vec<&'static str> {
    vec!["vector"]
}

pub fn search_database_tables() -> Vec<&'static str> {
    let mut tables = search_index_tables();
    tables.extend(search_document_tables());
    tables.extend(search_operational_tables());
    tables.extend(search_management_tables());
    tables.extend(search_recommendation_tables());
    tables
}

pub fn search_initial_migration_sql() -> &'static str {
    SEARCH_INITIAL_MIGRATION_SQL
}

// Legacy migration SQL retained for contract tests. Runtime PostgreSQL bootstrap uses
// application-root `database/` via `sdkwork-search-database-host`.

pub fn search_storage_capability_manifest() -> SearchStorageCapabilityManifest {
    SearchStorageCapabilityManifest {
        name: "search-storage",
        schema_version: "2026-06-06",
        tables: search_database_tables(),
        index_tables: search_index_tables(),
        document_tables: search_document_tables(),
        operational_tables: search_operational_tables(),
        management_tables: search_management_tables(),
        recommendation_tables: search_recommendation_tables(),
        postgresql_extensions: search_postgresql_extension_names(),
        optional_postgresql_extensions: search_optional_postgresql_extension_names(),
        migrations: vec![SEARCH_STORAGE_MIGRATION],
        repository_bindings: vec![
            SearchRepositoryBinding {
                domain: "search",
                repository_name: "SearchIndexRepository",
                tables: search_index_tables(),
                requires_transaction: true,
            },
            SearchRepositoryBinding {
                domain: "search",
                repository_name: "SearchDocumentRepository",
                tables: search_document_tables(),
                requires_transaction: true,
            },
            SearchRepositoryBinding {
                domain: "search",
                repository_name: "SearchOperationalRepository",
                tables: search_operational_tables(),
                requires_transaction: true,
            },
            SearchRepositoryBinding {
                domain: "search",
                repository_name: "SearchManagementRepository",
                tables: search_management_tables(),
                requires_transaction: true,
            },
            SearchRepositoryBinding {
                domain: "search",
                repository_name: "SearchProviderRepository",
                tables: vec!["search_provider_config", "search_provider_health_check"],
                requires_transaction: true,
            },
            SearchRepositoryBinding {
                domain: "search",
                repository_name: "SearchRecommendationRepository",
                tables: search_recommendation_tables(),
                requires_transaction: true,
            },
            SearchRepositoryBinding {
                domain: "search",
                repository_name: "SearchPromotionRepository",
                tables: vec!["search_promotion"],
                requires_transaction: true,
            },
        ],
    }
}
