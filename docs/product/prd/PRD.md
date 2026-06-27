# Search PRD

Status: draft
Owner: SDKWork maintainers
Application: search
Updated: 2026-06-26
Specs: REQUIREMENTS_SPEC.md, DOCUMENTATION_SPEC.md

## Document Map

- Add `PRD-<topic>.md` shards in this directory when the PRD grows beyond one reviewable screen.

## 1. Background And Problem

Applications across the SDKWork ecosystem need a unified search capability that combines full-text matching, fuzzy/autocomplete suggestions, and semantic vector retrieval. Today each application either ships ad-hoc SQL `LIKE` queries or depends on a dedicated search cluster (Elasticsearch, Meilisearch) that is expensive to operate for small tenants.

The problem is threefold: (1) no pluggable abstraction lets an application switch search backends without rewriting service code; (2) recommendation and promotion delivery are coupled to the query path with no first-class strategy model; (3) files uploaded to Drive cannot be indexed for search without a custom integration per application.

sdkwork-search provides a config-driven `SearchProvider` SPI with a capability-based registry, a PostgreSQL backend that reuses the existing database for full-text + fuzzy + semantic search, and a Drive-integrated document upload flow that turns uploaded files into searchable `IndexDocument` records.

## 2. Target Users

- **Application developers** integrate the App API (`/app/v3/api/search/*`) to add search, suggestions, semantic queries, recommendations, and promotions to their products. They consume the generated TypeScript SDK (`sdkwork-search-app-sdk`).
- **End users** experience search results, autocomplete suggestions, semantic matches, and personalized recommendations through the consuming application's UI (H5 / PC / mobile).
- **Platform operators** use the Backend API (`/backend/v3/api/search/*`) to manage indexes, documents, providers, synonyms, ranking profiles, recommendation strategies, promotions, embedding jobs, and A/B experiments.
- **Drive integrators** upload files via `POST /backend/search/documents/upload` so that document content is extracted, stored, and indexed for retrieval.

## 3. Goals And Non-Goals

**Goals**

- Provide a `SearchProvider` SPI that supports 9 provider kinds and 13 capabilities, selectable per-query by capability and priority.
- Ship two reference providers: in-memory (testing/small data) and PostgreSQL (production, using `tsvector` + `pg_trgm` + optional `pgvector`).
- Deliver 4 services: indexing, query, recommendation (5 strategies), and promotion (4 placements).
- Integrate Drive file upload so uploaded documents are indexed and retrievable.
- Expose App and Backend APIs through standard `HttpRoute::dual_token` contracts with tenant/organization isolation.

**Non-Goals**

- Not a replacement for operating a dedicated Elasticsearch/OpenSearch cluster at scale; the PostgreSQL backend targets Phase 1 workloads where a separate cluster is uneconomical.
- Not a cluster manager; provider health checks report status but do not orchestrate rebalancing or sharding.
- Not a document parsing pipeline; Phase 1 supports text extraction from plain uploads, not OCR or binary format parsing (PDF/Word) — see Open Questions.

## 4. Scope

**Phase 1 (current)**

- `SearchProvider` SPI: `SearchProvider` trait, 9 `SearchProviderKind` variants, 13 `SearchProviderCapability` variants, `SearchProviderRegistry` with capability-based selection.
- Two providers: `sdkwork-search-provider-memory`, `sdkwork-search-provider-postgresql`.
- Four services with port traits: indexing (`IndexingService`, `IndexingRepositoryPort`, `DocumentUploadPort`), query, recommendation (5 strategies), promotion (4 placements).
- SQLx repository crate with 18-table PostgreSQL migration (`pg_trgm`, `tsvector`, optional `pgvector`).
- App API (8 routes) and Backend API route-manifest contract.
- Drive integration: `DriveDocumentUploader` adapter + `POST /backend/search/documents/upload`.
- API server process with preflight, health, and graceful shutdown.

**Phase 2 (planned)**

- Elasticsearch and Meilisearch provider implementations behind the existing SPI.

**Phase 3 (planned)**

- Advanced recommendation algorithms (collaborative filtering model training, personalized ranking).
- Document parsing pipeline for PDF/Word extraction.

## 5. User Scenarios

- **Document search**: an operator indexes documents via `PUT /backend/v3/api/search/indexes/{indexId}/documents/{documentId}`; an end user queries via `POST /app/v3/api/search/queries` and receives ranked hits with payloads.
- **Autocomplete suggestions**: as the user types, the app calls `GET /app/v3/api/search/suggestions` backed by `pg_trgm` fuzzy matching on `search_query_suggestion`.
- **Semantic search**: the app calls `POST /app/v3/api/search/semantic_queries` to retrieve documents by meaning using `embedding_json` vectors (requires `pgvector`).
- **Drive file upload indexing**: a user uploads a file via `POST /backend/search/documents/upload`; the bytes are stored in `LocalDriveObjectStore`, a `drive_space_id` + `drive_node_id` reference is returned, and an `IndexDocument` with the drive reference is indexed by the selected provider.
- **Recommendations**: the app calls `POST /app/v3/api/search/recommendations` with a `RecommendationStrategyType` (`trending`, `content_based`, `collaborative_filtering`, `personalized`, `hybrid`) to receive ranked items.
- **Promotion delivery**: the app calls `POST /app/v3/api/search/promotions` to receive promoted content placed at `top`, `inline`, `banner`, or `sidebar`.

## 6. Success Metrics

- **Query latency**: P99 < 100 ms for App API `search/queries` on the PostgreSQL provider with a 1 M-row `search_document` table and a warm GIN index.
- **Indexing throughput**: sustained 500 documents/second via `bulk_upsert` on the PostgreSQL provider.
- **Suggestion latency**: P95 < 50 ms for `search/suggestions` backed by `pg_trgm`.
- **Recommendation click-through**: target 15% CTR uplift versus unranked baseline for the `hybrid` strategy.
- **Provider pluggability**: zero service-code changes required to swap Memory → PostgreSQL → Elasticsearch providers (verified by conformance tests).

## 7. Phases

**Phase 1 — Complete**

- SPI core (`sdkwork-search-provider-spi`) with 9 kinds and 13 capabilities.
- Memory and PostgreSQL providers implemented and registered.
- Indexing, query, recommendation, and promotion services implemented with port traits.
- 18-table PostgreSQL migration with `pg_trgm` and `tsvector`; `pgvector` optional.
- App API (8 routes) and Backend API route manifest contract.
- Drive integration via `DocumentUploadPort` + `DriveDocumentUploader` + multipart upload endpoint.
- API server with preflight, `/healthz` / `/readyz` / `/metrics`, and graceful shutdown.
- SQLx-backed `SearchRepositoryAdapter` implementing all four service port traits (`SearchQueryRepositoryPort`, `IndexingRepositoryPort`, `RecommendationRepositoryPort`, `PromotionRepositoryPort`) wired into the service layer.

**Phase 2 — Planned**

- Elasticsearch and Meilisearch providers.

**Phase 3 — Planned**

- Advanced recommendation algorithms.
- PDF/Word document parsing pipeline.

## 8. Linked Requirements

- `sdkwork-specs/SOUL.md` — specs before memory, stop on ambiguity, evidence before completion.
- `sdkwork-specs/WEB_BACKEND_SPEC.md` — backend service and route contract.
- `sdkwork-specs/RUST_CODE_SPEC.md` — Rust code style and module layout.
- `sdkwork-specs/DRIVE_SPEC.md` §9.1 — server-side Rust upload integration.
- `sdkwork-specs/DATABASE_FRAMEWORK_SPEC.md` — migration and repository conventions.
- `sdkwork-specs/REQUIREMENTS_SPEC.md` — PRD structure and fields.

## 9. Open Questions

- **Elasticsearch provider**: which client crate and connection model (cloud vs. self-hosted) should the Elasticsearch provider target in Phase 2? The SPI contract is ready but no implementation exists.
- **Advanced document parsing**: how should PDF/Word/PPTX content extraction be integrated? Options include a sidecar extraction service, an in-process Rust crate, or delegating to Drive's future parsing capability.
- **pgvector adoption**: should `pgvector` become a hard requirement for semantic search, or remain optional with a graceful fallback to JSONB-stored embeddings and application-side similarity?
- **A/B experiment assignment**: the backend route manifest declares experiment and assignment endpoints; what is the required assignment algorithm (deterministic hash vs. sticky session) for Phase 2?
