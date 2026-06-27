//! Route manifest for search app-api (`WEB_BACKEND_SPEC.md`).

use crate::paths;
use sdkwork_web_contract::{HttpMethod, HttpRoute};

pub const ROUTES: &[HttpRoute] = &[
    HttpRoute::dual_token(
        HttpMethod::Post,
        paths::queries::PATH,
        "search",
        "search.queries.create",
    ),
    HttpRoute::dual_token(
        HttpMethod::Get,
        paths::indexes::PATH,
        "search",
        "search.indexes.list",
    ),
    HttpRoute::dual_token(
        HttpMethod::Get,
        paths::suggestions::PATH,
        "search",
        "search.suggestions.list",
    ),
    HttpRoute::dual_token(
        HttpMethod::Post,
        paths::recommendations::PATH,
        "search",
        "search.recommendations.create",
    ),
    HttpRoute::dual_token(
        HttpMethod::Post,
        paths::promotions::PATH,
        "search",
        "search.promotions.create",
    ),
    HttpRoute::dual_token(
        HttpMethod::Post,
        paths::events::PATH,
        "search",
        "search.events.create",
    ),
    HttpRoute::dual_token(
        HttpMethod::Get,
        paths::recent_queries::PATH,
        "search",
        "search.recentQueries.list",
    ),
    HttpRoute::dual_token(
        HttpMethod::Post,
        paths::semantic_queries::PATH,
        "search",
        "search.semanticQueries.create",
    ),
];
