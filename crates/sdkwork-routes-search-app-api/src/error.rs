//! Error types for search app-api routes (`WEB_BACKEND_SPEC.md`).

use axum::http::StatusCode;
use axum::response::{IntoResponse, Response};
use axum::Json;
use serde_json::json;

/// Errors raised by search app-api route handlers.
#[derive(Debug, thiserror::Error)]
pub enum SearchRouteError {
    #[error("invalid request: {0}")]
    InvalidRequest(String),

    #[error("search provider error: {0}")]
    Provider(String),
}

impl IntoResponse for SearchRouteError {
    fn into_response(self) -> Response {
        let status = match &self {
            Self::InvalidRequest(_) => StatusCode::BAD_REQUEST,
            Self::Provider(_) => StatusCode::INTERNAL_SERVER_ERROR,
        };
        let body = json!({
            "type": "about:blank",
            "title": "Search Route Error",
            "status": status.as_u16(),
            "detail": self.to_string(),
        });
        (status, Json(body)).into_response()
    }
}
