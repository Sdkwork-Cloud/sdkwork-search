//! Repository error types for the search indexing SQLx repository.
//!
//! Errors are typed so callers (service layer) can take meaningful action per
//! `RUST_CODE_SPEC.md` §5. HTTP boundary mapping happens in route crates, not here.

use std::fmt;

/// Error returned by search indexing repository operations.
#[derive(Debug)]
pub enum RepositoryError {
    /// The requested row or aggregate was not found.
    NotFound(String),
    /// The operation violated a uniqueness or conflict constraint.
    Conflict(String),
    /// A backend database error from sqlx.
    Backend(sqlx::Error),
    /// A (de)serialization failure for JSON or row mapping.
    Serialization(String),
    /// A configuration or pool precondition was not satisfied.
    Configuration(String),
}

/// Convenience result alias used across repository methods.
pub type RepositoryResult<T> = Result<T, RepositoryError>;

impl fmt::Display for RepositoryError {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            Self::NotFound(msg) => write!(f, "repository resource not found: {msg}"),
            Self::Conflict(msg) => write!(f, "repository conflict: {msg}"),
            Self::Backend(err) => write!(f, "repository backend error: {err}"),
            Self::Serialization(msg) => write!(f, "repository serialization error: {msg}"),
            Self::Configuration(msg) => write!(f, "repository configuration error: {msg}"),
        }
    }
}

impl std::error::Error for RepositoryError {
    fn source(&self) -> Option<&(dyn std::error::Error + 'static)> {
        match self {
            Self::Backend(err) => Some(err),
            _ => None,
        }
    }
}

impl From<sqlx::Error> for RepositoryError {
    fn from(err: sqlx::Error) -> Self {
        match err {
            sqlx::Error::RowNotFound => Self::NotFound("row not found".into()),
            sqlx::Error::Database(ref db) if db.is_unique_violation() => {
                Self::Conflict(db.message().to_string())
            }
            sqlx::Error::Database(ref db) if db.is_foreign_key_violation() => {
                Self::Conflict(db.message().to_string())
            }
            other => Self::Backend(other),
        }
    }
}

impl From<serde_json::Error> for RepositoryError {
    fn from(err: serde_json::Error) -> Self {
        Self::Serialization(err.to_string())
    }
}
