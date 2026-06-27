//! Canonical path constants for search app-api (`WEB_BACKEND_SPEC.md`).

macro_rules! search_app_path {
    ($suffix:literal) => {
        concat!("/app/v3/api/search", $suffix)
    };
}

pub const API_PREFIX: &str = "/app/v3/api/search";

pub mod queries {
    pub const PATH: &str = search_app_path!("/queries");
}

pub mod indexes {
    pub const PATH: &str = search_app_path!("/indexes");
}

pub mod suggestions {
    pub const PATH: &str = search_app_path!("/suggestions");
}

pub mod recommendations {
    pub const PATH: &str = search_app_path!("/recommendations");
}

pub mod promotions {
    pub const PATH: &str = search_app_path!("/promotions");
}

pub mod events {
    pub const PATH: &str = search_app_path!("/events");
}

pub mod recent_queries {
    pub const PATH: &str = search_app_path!("/recent_queries");
}

pub mod semantic_queries {
    pub const PATH: &str = search_app_path!("/semantic_queries");
}
