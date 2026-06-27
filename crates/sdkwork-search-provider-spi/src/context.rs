//! Search provider execution context.

use std::collections::HashMap;

/// Execution context passed to every provider call.
///
/// Carries tenant, organization, user, app, trace, and optional metadata resolved from
/// `WebRequestContext` by the service layer. Providers MUST NOT parse HTTP headers; they receive
/// tenant/data-scope decisions through this context per `WEB_BACKEND_SPEC.md` §5.
#[derive(Debug, Clone)]
pub struct SearchProviderContext {
    pub tenant_id: i64,
    pub organization_id: i64,
    pub user_id: Option<i64>,
    pub app_id: Option<String>,
    pub session_id: Option<String>,
    pub request_id: Option<String>,
    pub trace_id: Option<String>,
    pub data_scope: SearchDataScope,
    pub permissions: Vec<String>,
    pub metadata: HashMap<String, String>,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Default)]
pub enum SearchDataScope {
    #[default]
    Tenant,
    Organization,
    Personal,
    Platform,
}

impl Default for SearchProviderContext {
    fn default() -> Self {
        Self {
            tenant_id: 0,
            organization_id: 0,
            user_id: None,
            app_id: None,
            session_id: None,
            request_id: None,
            trace_id: None,
            data_scope: SearchDataScope::Tenant,
            permissions: Vec::new(),
            metadata: HashMap::new(),
        }
    }
}

impl SearchProviderContext {
    pub fn builder() -> SearchProviderContextBuilder {
        SearchProviderContextBuilder::default()
    }
}

#[derive(Debug, Default)]
pub struct SearchProviderContextBuilder {
    tenant_id: i64,
    organization_id: i64,
    user_id: Option<i64>,
    app_id: Option<String>,
    session_id: Option<String>,
    request_id: Option<String>,
    trace_id: Option<String>,
    data_scope: SearchDataScope,
    permissions: Vec<String>,
    metadata: HashMap<String, String>,
}

impl SearchProviderContextBuilder {
    pub fn tenant_id(mut self, v: i64) -> Self {
        self.tenant_id = v;
        self
    }
    pub fn organization_id(mut self, v: i64) -> Self {
        self.organization_id = v;
        self
    }
    pub fn user_id(mut self, v: Option<i64>) -> Self {
        self.user_id = v;
        self
    }
    pub fn app_id(mut self, v: impl Into<String>) -> Self {
        self.app_id = Some(v.into());
        self
    }
    pub fn session_id(mut self, v: impl Into<String>) -> Self {
        self.session_id = Some(v.into());
        self
    }
    pub fn request_id(mut self, v: impl Into<String>) -> Self {
        self.request_id = Some(v.into());
        self
    }
    pub fn trace_id(mut self, v: impl Into<String>) -> Self {
        self.trace_id = Some(v.into());
        self
    }
    pub fn data_scope(mut self, v: SearchDataScope) -> Self {
        self.data_scope = v;
        self
    }
    pub fn permissions(mut self, v: Vec<String>) -> Self {
        self.permissions = v;
        self
    }
    pub fn metadata(mut self, v: HashMap<String, String>) -> Self {
        self.metadata = v;
        self
    }

    pub fn build(self) -> SearchProviderContext {
        SearchProviderContext {
            tenant_id: self.tenant_id,
            organization_id: self.organization_id,
            user_id: self.user_id,
            app_id: self.app_id,
            session_id: self.session_id,
            request_id: self.request_id,
            trace_id: self.trace_id,
            data_scope: self.data_scope,
            permissions: self.permissions,
            metadata: self.metadata,
        }
    }
}
