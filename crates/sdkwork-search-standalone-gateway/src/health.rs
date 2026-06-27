//! Readiness check assembly.
//!
//! Per `RUST_CODE_SPEC.md` this file assembles `ReadinessCheck` implementations
//! and does not define local `/healthz` routes; infra routes are mounted by
//! `sdkwork-web-bootstrap::mount_infra_routes`.

use std::sync::Arc;

use sdkwork_web_bootstrap::{CompositeReadinessCheck, PgPoolReadinessCheck, ReadinessCheck};
use sqlx::PgPool;

/// Build the composite readiness probe for the API server.
///
/// Currently checks PostgreSQL pool reachability. Additional probes (provider
/// health, cache, etc.) can be appended to the composite.
pub fn build_readiness_check(pool: PgPool) -> Arc<dyn ReadinessCheck> {
    let checks: Vec<Arc<dyn ReadinessCheck>> = vec![Arc::new(PgPoolReadinessCheck::new(pool))];
    Arc::new(CompositeReadinessCheck::new(checks))
}
