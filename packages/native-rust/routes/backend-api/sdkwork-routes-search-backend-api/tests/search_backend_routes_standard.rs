use sdkwork_routes_search_backend_api::{
    search_backend_api_manifest, SEARCH_BACKEND_API_AUTH_MODE, SEARCH_BACKEND_API_AUTHORITY,
    SEARCH_BACKEND_API_PREFIX, SEARCH_BACKEND_SDK_FAMILY,
};

#[test]
fn declares_standard_backend_api_route_manifest() {
    let manifest = search_backend_api_manifest();

    assert_eq!(manifest.kind, "sdkwork.route.manifest");
    assert_eq!(manifest.package_name, "sdkwork-routes-search-backend-api");
    assert_eq!(manifest.surface, "backend-api");
    assert_eq!(manifest.owner, "sdkwork-search");
    assert_eq!(manifest.domain, "search");
    assert_eq!(manifest.capability, "search");
    assert_eq!(manifest.api_authority, SEARCH_BACKEND_API_AUTHORITY);
    assert_eq!(manifest.sdk_family, SEARCH_BACKEND_SDK_FAMILY);
    assert_eq!(manifest.prefix, SEARCH_BACKEND_API_PREFIX);
    assert_eq!(manifest.routes.len(), 4);
}

#[test]
fn backend_api_routes_use_backend_prefix_and_dual_token_auth() {
    let manifest = search_backend_api_manifest();

    for route in &manifest.routes {
        assert!(route.path.starts_with(SEARCH_BACKEND_API_PREFIX));
        assert_eq!(route.auth_mode, SEARCH_BACKEND_API_AUTH_MODE);
        assert_eq!(route.ownership_owner, "sdkwork-search");
        assert_eq!(route.ownership_api_authority, SEARCH_BACKEND_API_AUTHORITY);
        assert_eq!(route.source_route_crate, "sdkwork-routes-search-backend-api");
    }

    for operation_id in [
        "search.indexes.list",
        "search.indexes.create",
        "search.documents.upsert",
        "search.documents.delete",
    ] {
        assert!(
            manifest.routes.iter().any(|route| route.operation_id == operation_id),
            "missing backend operation: {operation_id}",
        );
    }
}
