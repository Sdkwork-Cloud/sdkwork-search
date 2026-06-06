pub const SEARCH_STORAGE_MIGRATION: &str = "0001_search_storage.sql";

const SEARCH_INITIAL_MIGRATION_SQL: &str =
    include_str!("../migrations/0001_search_storage.sql");

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
    vec!["search_query_audit", "search_index_job"]
}

pub fn search_database_tables() -> Vec<&'static str> {
    let mut tables = search_index_tables();
    tables.extend(search_document_tables());
    tables.extend(search_operational_tables());
    tables
}

pub fn search_initial_migration_sql() -> &'static str {
    SEARCH_INITIAL_MIGRATION_SQL
}

pub fn search_storage_capability_manifest() -> SearchStorageCapabilityManifest {
    SearchStorageCapabilityManifest {
        name: "search-storage",
        schema_version: "2026-06-06",
        tables: search_database_tables(),
        index_tables: search_index_tables(),
        document_tables: search_document_tables(),
        operational_tables: search_operational_tables(),
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
        ],
    }
}
