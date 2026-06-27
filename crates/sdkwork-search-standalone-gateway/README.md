# sdkwork-search-standalone-gateway

HTTP API server process for SDKWork Search.

Assembles the 18-stage `WebCallInterceptorChain` through `sdkwork-web-bootstrap` per
`WEB_FRAMEWORK_SPEC.md`, mounts `sdkwork-routes-search-app-api` and
`sdkwork-routes-search-backend-api` route crates, wires the search provider registry,
and runs preflight checks before serving traffic.

## Structure

- `src/main.rs` - process entry point (`init_tracing_from_env`, config, `listen`).
- `src/lib.rs` - module assembly and re-exports.
- `src/bootstrap/` - config, application state, database pool, provider registry,
  service construction, and axum router assembly.
- `src/server/` - HTTP listener and graceful shutdown coordination.
- `src/preflight/` - database and provider readiness checks run before serving.
- `src/health.rs` - `ReadinessCheck` assembly (`PgPoolReadinessCheck`); infra routes
  (`/healthz`, `/readyz`, `/metrics`) are mounted by `sdkwork-web-bootstrap`.

## Verification

```sh
cargo check -p sdkwork-search-standalone-gateway
cargo clippy -p sdkwork-search-standalone-gateway -- -D warnings
```
