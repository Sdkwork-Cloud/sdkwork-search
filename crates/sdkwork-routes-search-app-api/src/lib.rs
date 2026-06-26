pub const SEARCH_APP_API_PREFIX: &str = "/app/v3/api";
pub const SEARCH_APP_API_AUTHORITY: &str = "sdkwork-search-app-api";
pub const SEARCH_APP_SDK_FAMILY: &str = "sdkwork-search-app-sdk";
pub const SEARCH_APP_API_AUTH_MODE: &str = "dual-token";

#[derive(Clone, Debug, Eq, PartialEq)]
pub struct SearchRouteManifest {
    pub kind: &'static str,
    pub package_name: &'static str,
    pub surface: &'static str,
    pub owner: &'static str,
    pub domain: &'static str,
    pub capability: &'static str,
    pub api_authority: &'static str,
    pub sdk_family: &'static str,
    pub prefix: &'static str,
    pub routes: Vec<SearchRoute>,
}

#[derive(Clone, Debug, Eq, PartialEq)]
pub struct SearchRoute {
    pub method: &'static str,
    pub path: &'static str,
    pub operation_id: &'static str,
    pub tag: &'static str,
    pub auth_mode: &'static str,
    pub handler_module: &'static str,
    pub handler_name: &'static str,
    pub request_schema: Option<&'static str>,
    pub response_schema: &'static str,
    pub ownership_owner: &'static str,
    pub ownership_api_authority: &'static str,
    pub source_route_crate: &'static str,
}

pub fn search_app_api_manifest() -> SearchRouteManifest {
    SearchRouteManifest {
        kind: "sdkwork.route.manifest",
        package_name: "sdkwork-routes-search-app-api",
        surface: "app-api",
        owner: "sdkwork-search",
        domain: "search",
        capability: "search",
        api_authority: SEARCH_APP_API_AUTHORITY,
        sdk_family: SEARCH_APP_SDK_FAMILY,
        prefix: SEARCH_APP_API_PREFIX,
        routes: vec![
            SearchRoute {
                method: "POST",
                path: "/app/v3/api/search/queries",
                operation_id: "search.queries.create",
                tag: "search",
                auth_mode: SEARCH_APP_API_AUTH_MODE,
                handler_module: "crate::handlers",
                handler_name: "create_search_query",
                request_schema: Some("SearchQueryRequest"),
                response_schema: "SearchQueryResponse",
                ownership_owner: "sdkwork-search",
                ownership_api_authority: SEARCH_APP_API_AUTHORITY,
                source_route_crate: "sdkwork-routes-search-app-api",
            },
            SearchRoute {
                method: "GET",
                path: "/app/v3/api/search/indexes",
                operation_id: "search.indexes.list",
                tag: "search",
                auth_mode: SEARCH_APP_API_AUTH_MODE,
                handler_module: "crate::handlers",
                handler_name: "list_search_indexes",
                request_schema: None,
                response_schema: "SearchIndexListResponse",
                ownership_owner: "sdkwork-search",
                ownership_api_authority: SEARCH_APP_API_AUTHORITY,
                source_route_crate: "sdkwork-routes-search-app-api",
            },
            SearchRoute {
                method: "GET",
                path: "/app/v3/api/search/suggestions",
                operation_id: "search.suggestions.list",
                tag: "search",
                auth_mode: SEARCH_APP_API_AUTH_MODE,
                handler_module: "crate::handlers",
                handler_name: "list_search_suggestions",
                request_schema: None,
                response_schema: "SearchSuggestionsResponse",
                ownership_owner: "sdkwork-search",
                ownership_api_authority: SEARCH_APP_API_AUTHORITY,
                source_route_crate: "sdkwork-routes-search-app-api",
            },
            SearchRoute {
                method: "POST",
                path: "/app/v3/api/search/recommendations",
                operation_id: "search.recommendations.create",
                tag: "search",
                auth_mode: SEARCH_APP_API_AUTH_MODE,
                handler_module: "crate::handlers",
                handler_name: "create_search_recommendation",
                request_schema: Some("SearchRecommendationRequest"),
                response_schema: "SearchRecommendationResponse",
                ownership_owner: "sdkwork-search",
                ownership_api_authority: SEARCH_APP_API_AUTHORITY,
                source_route_crate: "sdkwork-routes-search-app-api",
            },
            SearchRoute {
                method: "POST",
                path: "/app/v3/api/search/promotions",
                operation_id: "search.promotions.create",
                tag: "search",
                auth_mode: SEARCH_APP_API_AUTH_MODE,
                handler_module: "crate::handlers",
                handler_name: "create_search_promotion_delivery",
                request_schema: Some("SearchPromotionRequest"),
                response_schema: "SearchPromotionResponse",
                ownership_owner: "sdkwork-search",
                ownership_api_authority: SEARCH_APP_API_AUTHORITY,
                source_route_crate: "sdkwork-routes-search-app-api",
            },
            SearchRoute {
                method: "POST",
                path: "/app/v3/api/search/events",
                operation_id: "search.events.create",
                tag: "search",
                auth_mode: SEARCH_APP_API_AUTH_MODE,
                handler_module: "crate::handlers",
                handler_name: "create_search_user_event",
                request_schema: Some("SearchUserEvent"),
                response_schema: "SearchUserEventResponse",
                ownership_owner: "sdkwork-search",
                ownership_api_authority: SEARCH_APP_API_AUTHORITY,
                source_route_crate: "sdkwork-routes-search-app-api",
            },
            SearchRoute {
                method: "GET",
                path: "/app/v3/api/search/recent_queries",
                operation_id: "search.recentQueries.list",
                tag: "search",
                auth_mode: SEARCH_APP_API_AUTH_MODE,
                handler_module: "crate::handlers",
                handler_name: "list_search_recent_queries",
                request_schema: None,
                response_schema: "SearchRecentQueryListResponse",
                ownership_owner: "sdkwork-search",
                ownership_api_authority: SEARCH_APP_API_AUTHORITY,
                source_route_crate: "sdkwork-routes-search-app-api",
            },
            SearchRoute {
                method: "POST",
                path: "/app/v3/api/search/semantic_queries",
                operation_id: "search.semanticQueries.create",
                tag: "search",
                auth_mode: SEARCH_APP_API_AUTH_MODE,
                handler_module: "crate::handlers",
                handler_name: "create_search_semantic_query",
                request_schema: Some("SearchSemanticQueryRequest"),
                response_schema: "SearchSemanticQueryResponse",
                ownership_owner: "sdkwork-search",
                ownership_api_authority: SEARCH_APP_API_AUTHORITY,
                source_route_crate: "sdkwork-routes-search-app-api",
            },
        ],
    }
}

pub fn gateway_route_manifest() -> SearchRouteManifest {
    search_app_api_manifest()
}

pub fn gateway_mount() -> axum::Router {
    axum::Router::new()
}
