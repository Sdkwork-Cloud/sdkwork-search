//! Route-level error for search backend-api (`WEB_BACKEND_SPEC.md`).

use axum::http::StatusCode;
use axum::response::{IntoResponse, Response};
use axum::Json;
use serde_json::json;

#[derive(Debug)]
pub enum SearchBackendRouteError {
    Internal(String),
}

impl std::fmt::Display for SearchBackendRouteError {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            SearchBackendRouteError::Internal(msg) => {
                write!(f, "search backend route error: {msg}")
            }
        }
    }
}

impl std::error::Error for SearchBackendRouteError {}

impl IntoResponse for SearchBackendRouteError {
    fn into_response(self) -> Response {
        let body = Json(json!({
            "error": "search_backend_route_error",
            "message": self.to_string(),
        }));
        (StatusCode::INTERNAL_SERVER_ERROR, body).into_response()
    }
}
