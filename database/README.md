# SEARCH Database Module

Canonical lifecycle assets for `sdkwork-search` per `DATABASE_FRAMEWORK_SPEC.md`.

- moduleId: `search`
- serviceCode: `SEARCH`
- tablePrefix: `search_`

## Commands

```bash
pnpm run db:validate
pnpm run db:plan
pnpm run db:init
pnpm run db:migrate
pnpm run db:seed
pnpm run db:status
pnpm run db:drift:check
pnpm run db:materialize:contract
```

## Migration status

Legacy SQL was consolidated into `ddl/baseline/postgres/0001_search_legacy_baseline.sql` for bootstrap review.
Author contract-first tables in `contract/schema.yaml`, then split baseline into versioned `migrations/` pairs.

Imported legacy sources:
- `crates/sdkwork-search-storage-sqlx-rust/migrations/0001_search_storage.sql`

Runtime services MUST create pools through `sdkwork-database-sqlx` and register `DefaultDatabaseModule` at bootstrap via `sdkwork-search-database-host`.

```rust
use sdkwork_search_storage_sqlx::connect_and_bootstrap_search_database_from_env;
```
