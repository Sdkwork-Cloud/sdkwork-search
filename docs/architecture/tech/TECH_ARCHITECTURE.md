# Search Technical Architecture

Status: active
Owner: SDKWork maintainers
Updated: 2026-06-26
Specs: ARCHITECTURE_DECISION_SPEC.md, DOCUMENTATION_SPEC.md

## Document Map

- [TECH-naming-deviations.md](TECH-naming-deviations.md)

## 1. Architecture Overview

sdkwork-search is a layered search engine and recommendation system composed of 14 Rust crates under a single Cargo workspace. The layers flow top-down as:

HTTP route crates (`sdkwork-routes-search-{app,backend}-api`) → gateway assembly (`sdkwork-api-search-assembly`) → API server process (`sdkwork-search-api-server`) → service crates (indexing / query / recommendation / promotion) → `SearchProvider` SPI → concrete providers (memory / postgresql) → repository ports → SQLx repository → PostgreSQL.

The `SearchProviderRegistry` is the central pluggability seam: service crates depend only on the `SearchProvider` trait and `SearchProviderRegistry`, never on concrete provider implementations. Provider selection is config-driven and capability-based (highest-priority enabled provider that supports the requested `SearchProviderCapability`). Drive file upload is abstracted behind `DocumentUploadPort` so the indexing service never imports Drive SDK types directly.

## 2. Technology Choices

- **Rust** (edition 2021) as the single implementation language across all crates.
- **axum 0.8** for HTTP routing, including multipart extraction for document upload.
- **sqlx 0.8** with the `postgres` feature for compile-time-checked SQL and migrations.
- **tokio 1.48** multi-threaded runtime for async I/O and graceful shutdown.
- **PostgreSQL** as the persistence backend with three search mechanisms:
  - `tsvector` (built-in) for full-text ranking via the `search_vector` GIN index.
  - `pg_trgm` extension for fuzzy matching and autocomplete on `title` / `suggestion_text`.
  - `pgvector` (optional) for semantic/vector search; the PostgreSQL provider attempts `CREATE EXTENSION IF NOT EXISTS vector` lazily and tolerates absence.
- **sdkwork-web-framework** (`web-bootstrap`, `web-core`, `web-axum`, `web-contract`) for infra route mounting, readiness checks, and `HttpRoute::dual_token` contracts.
- **sdkwork-database** (`database-spi`, `database-lifecycle`, `database-sqlx`) for pool lifecycle.
- **sdkwork-drive** (`uploader-service`, `workspace-service`, `storage-contract`, `storage-local`) for file upload indexing (Phase 5).
- **sdkwork-utils-rust** for `sha256_hash` content fingerprinting.

## 3. System Boundaries And Modules

The workspace declares 14 member crates with the following boundaries:

1. **sdkwork-search-provider-spi** — Core SPI: `SearchProvider` trait, `SearchProviderKind` (9 variants: Memory, Postgresql, Elasticsearch, Opensearch, Meilisearch, Typesense, Algolia, Vector, Custom), `SearchProviderCapability` (13 variants), `SearchProviderRegistry`, and data contracts (`SearchQuery`, `SearchResponse`, `IndexDocument`).
2. **sdkwork-search-provider-memory** — In-memory provider with substring scoring and cosine similarity; used for tests and small datasets.
3. **sdkwork-search-provider-postgresql** — PostgreSQL provider combining `tsvector` full-text, `pg_trgm` fuzzy, and `pgvector` semantic search.
4. **sdkwork-search-indexing-service** — `IndexingService`, `IndexingRepositoryPort`, and `DocumentUploadPort` (Drive integration port).
5. **sdkwork-search-query-service** — `QueryService` and `SearchQueryRepositoryPort` for query orchestration and audit.
6. **sdkwork-search-recommendation-service** — `RecommendationService` and `RecommendationRepositoryPort` with 5 strategies: `Trending`, `ContentBased`, `CollaborativeFiltering`, `Personalized`, `Hybrid`.
7. **sdkwork-search-promotion-service** — `PromotionService` and `PromotionRepositoryPort` with 4 placements: `Top`, `Inline`, `Banner`, `Sidebar`.
8. **sdkwork-search-indexing-repository-sqlx** — SQLx repository implementation: 18-table migration, 4 repositories (`SearchIndexRepository`, `SearchDocumentRepository`, `SearchSuggestionRepository`, `SearchUserEventRepository`).
9. **sdkwork-search-database-host** — Database host crate coordinating migrations.
10. **sdkwork-api-search-assembly** — Assembles `assemble_api_router` and exposes the route-crate inventory.
11. **sdkwork-search-api-server** — HTTP API server process: bootstrap (config / state / database / providers / services / routers / document uploader) + server (listen / shutdown) + preflight + health.
12. **sdkwork-search-service-host** — Service container and runtime.
13. **sdkwork-routes-search-app-api** — App API route crate (8 routes, `HttpRoute::dual_token` standard).
14. **sdkwork-routes-search-backend-api** — Backend API route crate (route-manifest contract covering indexes, documents, providers, synonyms, ranking profiles, recommendation strategies, promotions, embedding jobs, A/B experiments, analytics, and jobs).

## 4. Directory And Package Layout

```
sdkwork-search/
├── Cargo.toml                      # workspace manifest (14 members)
├── crates/
│   ├── sdkwork-search-provider-spi/          # SPI core
│   ├── sdkwork-search-provider-memory/       # memory provider
│   ├── sdkwork-search-provider-postgresql/   # postgresql provider
│   ├── sdkwork-search-indexing-service/      # indexing service + ports
│   ├── sdkwork-search-query-service/         # query service
│   ├── sdkwork-search-recommendation-service/# recommendation service
│   ├── sdkwork-search-promotion-service/     # promotion service
│   ├── sdkwork-search-indexing-repository-sqlx/  # SQLx repos + migrations
│   ├── sdkwork-search-database-host/         # migration host
│   ├── sdkwork-api-search-assembly/      # router assembly
│   ├── sdkwork-search-api-server/            # HTTP server process
│   ├── sdkwork-search-service-host/          # service container
│   ├── sdkwork-routes-search-app-api/        # app API routes
│   └── sdkwork-routes-search-backend-api/    # backend API routes
├── sdks/
│   ├── _route-manifests/                     # route manifest authorities
│   └── sdkwork-search-app-sdk/               # app SDK + OpenAPI
├── database/                                 # DDL, migrations, seeds, schema
└── docs/                                     # architecture, product, guides
```

## 5. API, SDK, And Data Ownership

Two API surfaces are owned by this repository, each declared as a route manifest under `sdks/_route-manifests/` and materialized as an OpenAPI authority:

- **App API** (`sdkwork-search-app-api`, prefix `/app/v3/api`): 8 routes including `search/queries`, `search/indexes`, `search/suggestions`, `search/recommendations`, `search/promotions`, `search/events`, `search/recent_queries`, and `search/semantic_queries`. All use `dual-token` auth with tenant/organization scoping.
- **Backend API** (`sdkwork-search-backend-api`, prefix `/backend/v3/api`): route manifest covering indexes CRUD, document upsert/bulk/delete, synonyms, ranking profiles, recommendation strategies, promotions CRUD, embedding jobs, A/B experiments, analytics overview, providers management, and rebuild jobs — all `dual-token` with `BackendRequestContext`.

A multipart document upload endpoint `POST /backend/search/documents/upload` is mounted directly on the application router in `sdkwork-search-api-server::bootstrap::routers` (outside the route-manifest crate). It parses multipart fields (`index_key`, `document_id`, `tenant_id`, `organization_id`, `file`) and delegates to `IndexingService::ingest_document_from_upload`.

Data ownership: all 18 tables use the `search_` prefix and carry `tenant_id` + `organization_id` columns for multi-tenant isolation. The `search_document` table owns `search_vector` (tsvector), `embedding_json` (JSONB), and `payload_json` (JSONB).

## 6. Security, Privacy, And Observability

- **Auth**: every route uses `HttpRoute::dual_token` mode with required permission grants and `tenantScope: tenant` / `dataScope: organization`. App API routes carry `AppRequestContext`; backend routes carry `BackendRequestContext`.
- **Tenant isolation**: all tables and queries filter by `tenant_id` and `organization_id`; unique constraints include both columns.
- **Preflight**: `run_preflight` executes before the listener accepts traffic, verifying database connectivity and provider health.
- **Health endpoints**: `/healthz`, `/readyz`, `/metrics` are mounted by `sdkwork-web-bootstrap::mount_infra_routes`; readiness is a `CompositeReadinessCheck` currently wrapping `PgPoolReadinessCheck`.
- **Observability**: `tracing` is used across services; `search_query_audit` and `search_user_event` tables persist query and interaction telemetry for analytics.

## 7. Deployment And Runtime Topology

The single deployable is `sdkwork-search-api-server` (binary `main.rs`). The bootstrap sequence is:

1. Load `SearchApiServerConfig`.
2. Build the PostgreSQL `PgPool`.
3. Run `run_preflight` (database + provider health).
4. Construct providers via `SearchProviderRegistryBuilder` and register memory/postgresql factories.
5. Construct services (query / indexing / recommendation / promotion) with provider registry and repository ports.
6. Build `DriveDocumentUploader` (`LocalDriveObjectStore` + `DriveUploaderService`) and inject into `IndexingService`.
7. Assemble `build_application_router` merging app + backend route crates, the upload route, and infra routes.
8. `listen` on the configured address; `shutdown` on Tokio signal.

`sdkwork-search-service-host` provides the container/runtime abstraction. `sdkwork-api-search-assembly` exposes `assemble_api_router` and the route-crate package inventory for tooling.

## 8. Architecture Decision Index

- **ADR-1 Pluggable provider SPI**: service crates depend on `SearchProvider` trait + `SearchProviderRegistry`, never on concrete providers. Enables swapping Memory → PostgreSQL → Elasticsearch without service changes.
- **ADR-2 Capability-based selection**: `SearchProviderRegistry::select_for_capability` picks the highest-priority enabled provider supporting the requested `SearchProviderCapability`, keeping wiring config-driven.
- **ADR-3 Port-adapter for Drive**: `DocumentUploadPort` is defined in `indexing-service`; `DriveDocumentUploader` adapter lives in `api-server` bootstrap, isolating the Drive SDK dependency to the infrastructure layer.
- **ADR-4 Route manifest as API authority**: each surface (`app-api`, `backend-api`) has a `sdkwork.route.manifest` JSON under `sdks/_route-manifests/` that drives OpenAPI generation and SDK materialization; route crates implement the manifest contract.
- **ADR-5 PostgreSQL as multi-mechanism backend**: a single PostgreSQL instance serves full-text (`tsvector`), fuzzy (`pg_trgm`), and semantic (`pgvector`, optional) search to avoid a separate search cluster for Phase 1.

## 9. Verification

- `cargo check --workspace` — compile all 14 crates.
- `cargo clippy --workspace -- -D warnings` — lint per `RUST_CODE_SPEC.md`.
- `cargo test --workspace` — run unit and smoke tests (e.g. `repository_smoke`, route standard conformance tests).
- `cargo run -p sdkwork-search-api-server` — boot the server; verify `/healthz` and `/readyz` return 200.
- Database validation: the 18-table migration (`0001_search_storage.sql`) enables `pg_trgm`; the PostgreSQL provider lazily enables `vector` on first health check.
