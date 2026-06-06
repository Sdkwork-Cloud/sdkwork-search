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
    assert_eq!(manifest.routes.len(), 33);
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
        "search.indexes.update",
        "search.indexes.delete",
        "search.documents.upsert",
        "search.documents.bulkUpsert",
        "search.documents.delete",
        "search.synonyms.list",
        "search.synonyms.create",
        "search.synonyms.delete",
        "search.rankingProfiles.list",
        "search.rankingProfiles.create",
        "search.rankingProfiles.update",
        "search.recommendationStrategies.list",
        "search.recommendationStrategies.create",
        "search.recommendationStrategies.update",
        "search.promotions.list",
        "search.promotions.create",
        "search.promotions.update",
        "search.promotions.delete",
        "search.embeddingJobs.list",
        "search.embeddingJobs.create",
        "search.embeddingJobs.retry",
        "search.abExperiments.list",
        "search.abExperiments.create",
        "search.abExperiments.update",
        "search.abExperiments.assign",
        "search.jobs.rebuild.create",
        "search.analytics.overview.retrieve",
        "search.providers.list",
        "search.providers.create",
        "search.providers.update",
        "search.providers.healthChecks.create",
    ] {
        assert!(
            manifest.routes.iter().any(|route| route.operation_id == operation_id),
            "missing backend operation: {operation_id}",
        );
    }

    assert!(
        manifest
            .routes
            .iter()
            .all(|route| !route.path.contains("/auth") && !route.path.starts_with("/v1/search")),
        "backend search routes must not expose auth or legacy v1 paths",
    );
}

#[test]
fn backend_api_declares_provider_management_routes() {
    let manifest = search_backend_api_manifest();

    for (method, path, request_schema, response_schema) in [
        (
            "GET",
            "/backend/v3/api/search/providers",
            None,
            "SearchProviderListResponse",
        ),
        (
            "POST",
            "/backend/v3/api/search/providers",
            Some("SearchProviderCreateRequest"),
            "SearchProviderResponse",
        ),
        (
            "PATCH",
            "/backend/v3/api/search/providers/{providerId}",
            Some("SearchProviderUpdateRequest"),
            "SearchProviderResponse",
        ),
        (
            "POST",
            "/backend/v3/api/search/providers/{providerId}/health_checks",
            None,
            "SearchProviderHealthCheckResponse",
        ),
    ] {
        let route = manifest
            .routes
            .iter()
            .find(|route| route.method == method && route.path == path)
            .unwrap_or_else(|| panic!("missing provider route {method} {path}"));
        assert_eq!(route.request_schema, request_schema);
        assert_eq!(route.response_schema, response_schema);
        assert_eq!(route.tag, "search");
        assert!(
            route.operation_id.starts_with("search.providers."),
            "provider routes must use resource-style operation ids",
        );
    }
}
