use sdkwork_routes_search_app_api::{gateway_route_manifest, API_PREFIX};
use sdkwork_web_contract::{HttpMethod, RouteAuth};

#[test]
fn declares_eight_app_api_routes() {
    let routes = gateway_route_manifest();
    assert_eq!(routes.len(), 8, "app-api must declare exactly 8 routes");
}

#[test]
fn app_api_routes_use_canonical_prefix_and_dual_token_auth() {
    let routes = gateway_route_manifest();

    for route in routes {
        assert!(
            route.path.starts_with(API_PREFIX),
            "route {} must use canonical app prefix",
            route.path,
        );
        assert_eq!(
            route.auth,
            RouteAuth::DualToken,
            "route {} must require dual-token auth",
            route.operation_id,
        );
        assert_eq!(
            route.tag, "search",
            "route {} must use search tag",
            route.operation_id
        );
    }
}

#[test]
fn app_api_routes_expose_expected_operation_ids_and_methods() {
    let routes = gateway_route_manifest();

    let expected: &[(&str, HttpMethod, &str)] = &[
        (
            "search.queries.create",
            HttpMethod::Post,
            "/app/v3/api/search/queries",
        ),
        (
            "search.indexes.list",
            HttpMethod::Get,
            "/app/v3/api/search/indexes",
        ),
        (
            "search.suggestions.list",
            HttpMethod::Get,
            "/app/v3/api/search/suggestions",
        ),
        (
            "search.recommendations.create",
            HttpMethod::Post,
            "/app/v3/api/search/recommendations",
        ),
        (
            "search.promotions.create",
            HttpMethod::Post,
            "/app/v3/api/search/promotions",
        ),
        (
            "search.events.create",
            HttpMethod::Post,
            "/app/v3/api/search/events",
        ),
        (
            "search.recentQueries.list",
            HttpMethod::Get,
            "/app/v3/api/search/recent_queries",
        ),
        (
            "search.semanticQueries.create",
            HttpMethod::Post,
            "/app/v3/api/search/semantic_queries",
        ),
    ];

    for (operation_id, method, path) in expected {
        let found = routes.iter().find(|r| r.operation_id == *operation_id);
        assert!(found.is_some(), "missing app operation: {operation_id}");
        let route = found.unwrap();
        assert_eq!(route.method, *method, "{operation_id} method mismatch");
        assert_eq!(route.path, *path, "{operation_id} path mismatch");
    }
}

#[test]
fn app_api_routes_must_not_use_legacy_v1_prefix() {
    let routes = gateway_route_manifest();
    for route in routes {
        assert!(
            !route.path.starts_with("/v1/search"),
            "app route {} must not use legacy /v1/search",
            route.operation_id,
        );
    }
}
