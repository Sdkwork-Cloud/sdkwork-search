//! PostgreSQL SearchProvider using pg_trgm full-text + pgvector semantic search.
//!
//! Follows `WEB_BACKEND_SPEC.md` provider adapter layer and `RUST_CODE_SPEC.md`.
//! Requires PostgreSQL extensions: `pg_trgm` (fuzzy/full-text), `vector` (pgvector semantic).

mod provider;

pub use provider::{factory, PostgresqlSearchProvider};
