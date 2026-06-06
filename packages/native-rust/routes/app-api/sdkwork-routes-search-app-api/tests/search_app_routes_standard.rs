use sdkwork_routes_search_app_api::{
    search_app_api_manifest, SEARCH_APP_API_AUTH_MODE, SEARCH_APP_API_AUTHORITY,
    SEARCH_APP_API_PREFIX, SEARCH_APP_SDK_FAMILY,
};

#[test]
fn declares_standard_app_api_route_manifest() {
    let manifest = search_app_api_manifest();

    assert_eq!(manifest.kind, "sdkwork.route.manifest");
    assert_eq!(manifest.package_name, "sdkwork-routes-search-app-api");
    assert_eq!(manifest.surface, "app-api");
    assert_eq!(manifest.owner, "sdkwork-search");
    assert_eq!(manifest.domain, "search");
    assert_eq!(manifest.capability, "search");
    assert_eq!(manifest.api_authority, SEARCH_APP_API_AUTHORITY);
    assert_eq!(manifest.sdk_family, SEARCH_APP_SDK_FAMILY);
    assert_eq!(manifest.prefix, SEARCH_APP_API_PREFIX);
    assert_eq!(manifest.routes.len(), 2);
}

#[test]
fn app_api_routes_use_app_prefix_and_dual_token_auth() {
    let manifest = search_app_api_manifest();

    for route in &manifest.routes {
        assert!(route.path.starts_with(SEARCH_APP_API_PREFIX));
        assert_eq!(route.auth_mode, SEARCH_APP_API_AUTH_MODE);
        assert_eq!(route.ownership_owner, "sdkwork-search");
        assert_eq!(route.ownership_api_authority, SEARCH_APP_API_AUTHORITY);
        assert_eq!(route.source_route_crate, "sdkwork-routes-search-app-api");
    }

    assert!(manifest
        .routes
        .iter()
        .any(|route| route.operation_id == "search.queries.create"));
    assert!(manifest
        .routes
        .iter()
        .any(|route| route.operation_id == "search.indexes.list"));
}
