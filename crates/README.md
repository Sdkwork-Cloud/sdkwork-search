# crates/

Rust crates for the `sdkwork-search` workspace.

## Purpose

Contains Rust route crates, storage crates, and reusable Rust libraries for search functionality.

## Crates

| Crate | Purpose |
| --- | --- |
| `sdkwork-routes-search-app-api/` | App-api route manifest for `/app/v3/api/search/*` |
| `sdkwork-routes-search-backend-api/` | Backend-api route manifest for `/backend/v3/api/search/*` |
| `sdkwork-search-storage-sqlx-rust/` | SQL storage contracts and migrations |

## Owner

`sdkwork-search` workspace maintainers.

## Allowed Content

- Rust crate source (`src/`, `Cargo.toml`)
- Tests (`tests/`)
- Migrations (`migrations/`)
- Component specs (`specs/`)

## Forbidden Content

- TypeScript/JavaScript source
- Generated SDK output
- Runtime secrets or credentials

## Related Specs

- `../sdkwork-specs/RUST_CODE_SPEC.md`
- `../sdkwork-specs/WEB_BACKEND_SPEC.md`
- `../sdkwork-specs/DATABASE_SPEC.md`

## Verification

```powershell
cargo test --workspace
cargo clippy --workspace --tests -- -D warnings
```
