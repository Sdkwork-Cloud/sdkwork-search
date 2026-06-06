CREATE TABLE IF NOT EXISTS search_index (
    id BIGINT PRIMARY KEY,
    uuid VARCHAR(64) NOT NULL UNIQUE,
    tenant_id BIGINT NOT NULL DEFAULT 0,
    organization_id BIGINT NOT NULL DEFAULT 0,
    index_key VARCHAR(128) NOT NULL,
    title VARCHAR(256) NOT NULL,
    description TEXT,
    status INTEGER NOT NULL DEFAULT 1,
    data_scope INTEGER NOT NULL DEFAULT 0,
    config_json JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    version BIGINT NOT NULL DEFAULT 0,
    deleted_at TIMESTAMPTZ,
    deleted_by BIGINT,
    CONSTRAINT uk_search_index_key UNIQUE (tenant_id, organization_id, index_key)
);

CREATE TABLE IF NOT EXISTS search_document (
    id BIGINT PRIMARY KEY,
    uuid VARCHAR(64) NOT NULL UNIQUE,
    tenant_id BIGINT NOT NULL DEFAULT 0,
    organization_id BIGINT NOT NULL DEFAULT 0,
    index_id BIGINT NOT NULL,
    index_key VARCHAR(128) NOT NULL,
    document_id VARCHAR(160) NOT NULL,
    capability VARCHAR(128),
    scope VARCHAR(128) NOT NULL DEFAULT 'global',
    group_key VARCHAR(160),
    group_title VARCHAR(256),
    source_ref VARCHAR(512),
    title VARCHAR(512) NOT NULL,
    body_text TEXT,
    keyword_text TEXT,
    payload_json JSONB NOT NULL DEFAULT '{}'::jsonb,
    token_json JSONB NOT NULL DEFAULT '[]'::jsonb,
    status INTEGER NOT NULL DEFAULT 1,
    data_scope INTEGER NOT NULL DEFAULT 0,
    indexed_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    version BIGINT NOT NULL DEFAULT 0,
    deleted_at TIMESTAMPTZ,
    deleted_by BIGINT,
    CONSTRAINT uk_search_document_id UNIQUE (tenant_id, organization_id, index_key, document_id)
);

CREATE TABLE IF NOT EXISTS search_document_projection (
    id BIGINT PRIMARY KEY,
    uuid VARCHAR(64) NOT NULL UNIQUE,
    tenant_id BIGINT NOT NULL DEFAULT 0,
    organization_id BIGINT NOT NULL DEFAULT 0,
    index_key VARCHAR(128) NOT NULL,
    document_id VARCHAR(160) NOT NULL,
    capability VARCHAR(128),
    scope VARCHAR(128) NOT NULL DEFAULT 'global',
    group_key VARCHAR(160),
    group_title VARCHAR(256),
    title VARCHAR(512) NOT NULL,
    summary TEXT,
    payload_json JSONB NOT NULL DEFAULT '{}'::jsonb,
    rank_weight INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    version BIGINT NOT NULL DEFAULT 0,
    CONSTRAINT uk_search_document_projection_id UNIQUE (tenant_id, organization_id, index_key, document_id)
);

CREATE TABLE IF NOT EXISTS search_query_audit (
    id BIGINT PRIMARY KEY,
    uuid VARCHAR(64) NOT NULL UNIQUE,
    tenant_id BIGINT NOT NULL DEFAULT 0,
    organization_id BIGINT NOT NULL DEFAULT 0,
    user_id BIGINT NOT NULL DEFAULT 0,
    index_key VARCHAR(128) NOT NULL,
    q VARCHAR(512) NOT NULL,
    scope VARCHAR(128),
    capability VARCHAR(128),
    result_count INTEGER NOT NULL DEFAULT 0,
    request_id VARCHAR(128) NOT NULL,
    trace_id VARCHAR(128),
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS search_index_job (
    id BIGINT PRIMARY KEY,
    uuid VARCHAR(64) NOT NULL UNIQUE,
    tenant_id BIGINT NOT NULL DEFAULT 0,
    organization_id BIGINT NOT NULL DEFAULT 0,
    index_key VARCHAR(128) NOT NULL,
    job_type VARCHAR(64) NOT NULL,
    status INTEGER NOT NULL DEFAULT 0,
    payload_json JSONB NOT NULL DEFAULT '{}'::jsonb,
    scheduled_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    started_at TIMESTAMPTZ,
    finished_at TIMESTAMPTZ,
    error_summary TEXT,
    retry_count INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    version BIGINT NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_search_index_scope_status
    ON search_index (tenant_id, organization_id, status, updated_at);

CREATE INDEX IF NOT EXISTS idx_search_document_index_scope_updated
    ON search_document (tenant_id, organization_id, index_key, scope, updated_at);

CREATE INDEX IF NOT EXISTS idx_search_document_capability
    ON search_document (tenant_id, organization_id, capability, updated_at);

CREATE INDEX IF NOT EXISTS idx_search_document_projection_index_group
    ON search_document_projection (tenant_id, organization_id, index_key, group_key, rank_weight);

CREATE INDEX IF NOT EXISTS idx_search_query_audit_tenant_created
    ON search_query_audit (tenant_id, organization_id, created_at);

CREATE INDEX IF NOT EXISTS idx_search_index_job_status_scheduled
    ON search_index_job (tenant_id, organization_id, status, scheduled_at);
