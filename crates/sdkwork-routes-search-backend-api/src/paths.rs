//! Canonical path constants for search backend-api (`WEB_BACKEND_SPEC.md`).

macro_rules! search_path {
    ($suffix:literal) => {
        concat!("/backend/v3/api/search", $suffix)
    };
}

pub const API_PREFIX: &str = "/backend/v3/api/search";

pub mod indexes {
    pub const COLLECTION: &str = search_path!("/indexes");
    pub const BY_KEY: &str = search_path!("/indexes/{index_key}");
    pub const REBUILD: &str = search_path!("/indexes/{index_key}/rebuild");
}

pub mod providers {
    pub const COLLECTION: &str = search_path!("/providers");
    pub const HEALTH: &str = search_path!("/providers/health");
}

pub mod documents {
    pub const COLLECTION: &str = search_path!("/documents");
    pub const BY_ID: &str = search_path!("/documents/{document_id}");
    pub const INDEX: &str = search_path!("/documents/index");
    pub const BATCH: &str = search_path!("/documents/batch");
}

pub mod recommendations {
    pub const STRATEGIES: &str = search_path!("/recommendations/strategies");
}

pub mod promotions {
    pub const COLLECTION: &str = search_path!("/promotions");
    pub const BY_ID: &str = search_path!("/promotions/{promotion_id}");
}

pub mod audit {
    pub const PATH: &str = search_path!("/audit");
}
