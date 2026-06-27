use sdkwork_routes_search_backend_api::{gateway_route_manifest, API_PREFIX};
use sdkwork_web_contract::{HttpMethod, RouteAuth};

#[test]
fn declares_standard_backend_api_route_manifest() {
    let routes = gateway_route_manifest();
    assert!(!routes.is_empty());
    for route in routes {
        assert!(
            route.path.starts_with(API_PREFIX),
            "route {} must use backend api prefix",
            route.path,
        );
        assert_eq!(route.auth, RouteAuth::DualToken);
        assert_eq!(route.tag, "search");
    }
}

#[test]
fn backend_api_routes_use_backend_prefix_and_dual_token_auth() {
    let routes = gateway_route_manifest();
    let operation_ids: Vec<&str> = routes.iter().map(|r| r.operation_id).collect();

    for operation_id in [
        "search.indexes.list",
        "search.indexes.create",
        "search.indexes.delete",
        "search.providers.list",
        "search.providers.health",
        "search.documents.list",
        "search.documents.delete",
        "search.documents.index",
        "search.documents.batch",
        "search.recommendations.strategies.list",
        "search.promotions.list",
        "search.promotions.create",
        "search.audit.list",
    ] {
        assert!(
            operation_ids.contains(&operation_id),
            "missing backend operation: {operation_id}",
        );
    }

    for route in routes {
        assert!(
            !route.path.contains("/auth") && !route.path.starts_with("/v1/search"),
            "backend search routes must not expose auth or legacy v1 paths",
        );
    }
}

#[test]
fn backend_api_declares_index_management_routes() {
    let routes = gateway_route_manifest();
    let list_indexes = routes
        .iter()
        .find(|r| r.method == HttpMethod::Get && r.path == "/backend/v3/api/search/indexes")
        .expect("missing GET /indexes");
    assert_eq!(list_indexes.operation_id, "search.indexes.list");

    let delete_index = routes
        .iter()
        .find(|r| {
            r.method == HttpMethod::Delete && r.path == "/backend/v3/api/search/indexes/{index_key}"
        })
        .expect("missing DELETE /indexes/{index_key}");
    assert_eq!(delete_index.operation_id, "search.indexes.delete");
}
