# sdkwork-search

`sdkwork-search` owns SDKWork search contracts, service facades, UI wrappers, Rust storage, Rust route manifests, OpenAPI authority contracts, and generated SDK workspaces.

Search code was moved here so `sdkwork-appbase` can consume search as a dependency instead of owning local search packages.

## Directory Structure

```text
sdkwork-search/
  AGENTS.md                       # Agent entrypoint
  CLAUDE.md                       # Claude Code compatibility shim
  GEMINI.md                       # Gemini CLI compatibility shim
  CODEX.md                        # Codex compatibility shim
  .sdkwork/                       # Repository workspace metadata
  apis/                           # API contracts and materialization inputs (active)
  apps/                           # Application surface roots (active)
    sdkwork-search-pc/            # PC browser/desktop/tablet search application
    sdkwork-search-h5/            # H5/Capacitor mobile search application
    sdkwork-search-flutter-mobile/ # Flutter mobile search application
  crates/                         # Rust crates (active)
    sdkwork-routes-search-app-api/     # App-api route manifest
    sdkwork-routes-search-backend-api/ # Backend-api route manifest
    sdkwork-search-storage-sqlx-rust/  # SQL storage contracts and migrations
  sdks/                           # SDK families and generation (active)
    sdkwork-search-app-sdk/       # App/client SDK family
    sdkwork-search-backend-sdk/   # Backend/admin SDK family
  packages/                       # Shared TypeScript packages (active, architecture-local)
    common/
      sdkwork-search-contracts/   # Shared search contracts
      sdkwork-search-service/     # Search service facade
  configs/                        # Config templates (active)
  deployments/                    # Deployment descriptors (inactive, placeholder)
  docs/                           # Documentation (active)
  examples/                       # Runnable examples (inactive, placeholder)
  jobs/                           # Job definitions (inactive, placeholder)
  plugins/                        # Application plugins (inactive, placeholder)
  scripts/                        # Build and verification scripts (active)
  tests/                          # Cross-package tests (active)
  tools/                          # Developer tools (inactive, placeholder)
  specs/                          # Root component spec
```

### Active Capabilities

| Directory | Status | Purpose |
| --- | --- | --- |
| `apis/` | Active | API contract sources for SDK generation |
| `apps/` | Active | PC, H5, and Flutter application surface roots |
| `crates/` | Active | Rust route crates and storage crate |
| `sdks/` | Active | SDK family workspaces and generated output |
| `packages/` | Active | Shared TypeScript packages (common contracts and service) |
| `configs/` | Active | Config templates and schemas |
| `docs/` | Active | Documentation and architecture decisions |
| `scripts/` | Active | Build and verification entrypoints |
| `tests/` | Active | Cross-package and integration tests |

### Intentionally Absent Standard Directories

| Directory | Status | Reason |
| --- | --- | --- |
| `jobs/` | Placeholder | No scheduled jobs, queue consumers, or batch processing currently |
| `tools/` | Placeholder | No reusable validators, generators, or operator utilities currently |
| `plugins/` | Placeholder | No application/runtime plugins currently |
| `examples/` | Placeholder | No consumer-facing examples currently |
| `deployments/` | Placeholder | No Docker, Kubernetes, or deployment content currently |

## Packages

- `@sdkwork/search-contracts`: shared search documents, catalog normalization, ranking, grouping, and query response contracts.
- `@sdkwork/search-service`: service facade using injected app/backend SDK clients, with local catalog fallback for read-only queries.
- `@sdkwork/search-pc-react`: PC React search package wrapper over shared contracts.
- `@sdkwork/search-h5-react`: H5 mobile React search package wrapper over shared contracts.
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

## Documentation Canon

- [docs/README.md](docs/README.md)
- [docs/product/prd/PRD.md](docs/product/prd/PRD.md)
- [docs/architecture/tech/TECH_ARCHITECTURE.md](docs/architecture/tech/TECH_ARCHITECTURE.md)

## Application Roots

- [apps directory index](apps/README.md)
