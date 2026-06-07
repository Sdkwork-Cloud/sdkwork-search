# sdkwork-search

`sdkwork-search` owns SDKWork search contracts, service facades, UI wrappers, Rust storage, Rust route manifests, OpenAPI authority contracts, and generated SDK workspaces.

Search code was moved here so `sdkwork-appbase` can consume search as a dependency instead of owning local search packages.

## Packages

- `@sdkwork/search-contracts`: shared search documents, catalog normalization, ranking, grouping, and query response contracts.
- `@sdkwork/search-service`: service facade using injected app/backend SDK clients, with local catalog fallback for read-only queries.
- `@sdkwork/search-pc-react`: PC React search package wrapper over shared contracts.
- `@sdkwork/search-mobile-react`: mobile React search package wrapper over shared contracts.
- `sdkwork_search_storage_sqlx`: Rust SQL storage contracts and migrations.
- `sdkwork-routes-search-app-api`: Rust app-api route manifest for `/app/v3/api/search/*`.
- `sdkwork-routes-search-backend-api`: Rust backend-api route manifest for `/backend/v3/api/search/*`.

## SDKs

- `sdks/sdkwork-search-app-sdk`: app/client SDK family generated from `sdkwork-search-app-api`.
- `sdks/sdkwork-search-backend-sdk`: backend/admin SDK family generated from `sdkwork-search-backend-api`.

Both SDK families use the canonical generator:

```text
..\sdkwork-sdk-generator\bin\sdkgen.js
```

## Verification

Run from this directory:

```powershell
node .\sdks\materialize-search-v3-openapi-boundaries.mjs
pnpm test
pnpm typecheck
pnpm test:governance
cargo test
```

Generate TypeScript SDKs:

```powershell
.\sdks\sdkwork-search-app-sdk\bin\generate-sdk.ps1 -Languages typescript
.\sdks\sdkwork-search-backend-sdk\bin\generate-sdk.ps1 -Languages typescript
```


## SDKWork Documentation Contract

Domain: intelligence
Capability: search-workspace
Package type: rust-crate
Status: standard

### Public API

Public exports are declared in `specs/component.spec.json` under `contracts.publicExports`.

### Required SDK Surface

- None declared in `specs/component.spec.json`.

### Configuration

Configuration keys and runtime entrypoints are declared in `specs/component.spec.json`.

### SaaS/Private/Local Behavior

This module follows the canonical standards linked from `specs/component.spec.json`, including deployment and runtime configuration rules where applicable.

### Security

Do not add secrets, live tokens, manual auth headers, or app-local credential handling to this module.

### Extension Points

Extension points are limited to declared public exports, runtime entrypoints, SDK clients, events, and config keys.

### Verification

- `pnpm typecheck`

### Owner And Status

Owner and lifecycle status are tracked in `specs/component.spec.json`.
