# sdkwork-search-indexing-repository-sqlx

Domain: search
Capability: indexing-repository-sqlx
Package type: rust-crate
Status: standard

This README is the SDKWork module entrypoint for `sdkwork-search-indexing-repository-sqlx`. The crate owns the SQLx repository implementation for the SDKWork Search indexing capability following `RUST_CODE_SPEC.md` standard SQLx repository crate layout and `WEB_BACKEND_SPEC.md` §4.2.

## Responsibility

- Database schema constants (`db/schema.rs`).
- Database row types (`db/rows.rs`).
- Row-to-domain-model mapping (`mapper/`).
- SQL query text (`repository/queries.rs`).
- Concrete repository implementations for index, document, suggestion, and user-event aggregates.

Repository implementations receive tenant, organization, user, and data-scope inputs from service/context parameters. They do not own business policy, permission checks, HTTP concerns, or provider calls.

## Public API

- `SearchIndexRepository`
- `SearchDocumentRepository`
- `SearchSuggestionRepository`
- `SearchUserEventRepository`
- `RepositoryError` / `RepositoryResult`
- `SEARCH_INDEXING_MIGRATION_SQL`

## Verification

- `cargo check -p sdkwork-search-indexing-repository-sqlx`
- `cargo test -p sdkwork-search-indexing-repository-sqlx`
