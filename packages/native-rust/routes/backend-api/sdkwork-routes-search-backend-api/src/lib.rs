pub const SEARCH_BACKEND_API_PREFIX: &str = "/backend/v3/api";
pub const SEARCH_BACKEND_API_AUTHORITY: &str = "sdkwork-search-backend-api";
pub const SEARCH_BACKEND_SDK_FAMILY: &str = "sdkwork-search-backend-sdk";
pub const SEARCH_BACKEND_API_AUTH_MODE: &str = "dual-token";

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

pub fn search_backend_api_manifest() -> SearchRouteManifest {
    SearchRouteManifest {
        kind: "sdkwork.route.manifest",
        package_name: "sdkwork-routes-search-backend-api",
        surface: "backend-api",
        owner: "sdkwork-search",
        domain: "search",
        capability: "search",
        api_authority: SEARCH_BACKEND_API_AUTHORITY,
        sdk_family: SEARCH_BACKEND_SDK_FAMILY,
        prefix: SEARCH_BACKEND_API_PREFIX,
        routes: vec![
            SearchRoute {
                method: "GET",
                path: "/backend/v3/api/search/indexes",
                operation_id: "search.indexes.list",
                tag: "search",
                auth_mode: SEARCH_BACKEND_API_AUTH_MODE,
                handler_module: "crate::handlers",
                handler_name: "list_search_indexes",
                request_schema: None,
                response_schema: "SearchIndexListResponse",
                ownership_owner: "sdkwork-search",
                ownership_api_authority: SEARCH_BACKEND_API_AUTHORITY,
                source_route_crate: "sdkwork-routes-search-backend-api",
            },
            SearchRoute {
                method: "POST",
                path: "/backend/v3/api/search/indexes",
                operation_id: "search.indexes.create",
                tag: "search",
                auth_mode: SEARCH_BACKEND_API_AUTH_MODE,
                handler_module: "crate::handlers",
                handler_name: "create_search_index",
                request_schema: Some("SearchIndexCreateRequest"),
                response_schema: "SearchIndexResponse",
                ownership_owner: "sdkwork-search",
                ownership_api_authority: SEARCH_BACKEND_API_AUTHORITY,
                source_route_crate: "sdkwork-routes-search-backend-api",
            },
            SearchRoute {
                method: "PUT",
                path: "/backend/v3/api/search/indexes/{indexId}/documents/{documentId}",
                operation_id: "search.documents.upsert",
                tag: "search",
                auth_mode: SEARCH_BACKEND_API_AUTH_MODE,
                handler_module: "crate::handlers",
                handler_name: "upsert_search_document",
                request_schema: Some("SearchDocumentUpsertRequest"),
                response_schema: "SearchDocumentResponse",
                ownership_owner: "sdkwork-search",
                ownership_api_authority: SEARCH_BACKEND_API_AUTHORITY,
                source_route_crate: "sdkwork-routes-search-backend-api",
            },
            SearchRoute {
                method: "DELETE",
                path: "/backend/v3/api/search/indexes/{indexId}/documents/{documentId}",
                operation_id: "search.documents.delete",
                tag: "search",
                auth_mode: SEARCH_BACKEND_API_AUTH_MODE,
                handler_module: "crate::handlers",
                handler_name: "delete_search_document",
                request_schema: None,
                response_schema: "SearchDocumentDeleteResponse",
                ownership_owner: "sdkwork-search",
                ownership_api_authority: SEARCH_BACKEND_API_AUTHORITY,
                source_route_crate: "sdkwork-routes-search-backend-api",
            },
        ],
    }
}
