-- Migration 0002: Search performance and search_vector auto-population.
--
-- Adds:
-- 1. Sequences for surrogate ID generation (provider INSERTs without explicit id).
-- 2. search_vector trigger so every INSERT/UPDATE auto-populates the tsvector column.
-- 3. GIN index on payload_json for faceted filter queries.
-- 4. Composite index on search_user_event for trending/similar-document queries.
-- 5. GIN index on body_text trigram for fuzzy content matching.

-- ===========================================================================
-- 1. Sequences for ID generation
-- ===========================================================================

CREATE SEQUENCE IF NOT EXISTS search_document_id_seq;
CREATE SEQUENCE IF NOT EXISTS search_index_id_seq;
CREATE SEQUENCE IF NOT EXISTS search_promotion_id_seq;

ALTER TABLE search_document ALTER COLUMN id SET DEFAULT nextval('search_document_id_seq');
ALTER TABLE search_index ALTER COLUMN id SET DEFAULT nextval('search_index_id_seq');
ALTER TABLE search_promotion ALTER COLUMN id SET DEFAULT nextval('search_promotion_id_seq');

-- ===========================================================================
-- 2. search_vector auto-population trigger
-- ===========================================================================

CREATE OR REPLACE FUNCTION search_document_update_search_vector()
RETURNS TRIGGER AS $$
BEGIN
    NEW.search_vector :=
        to_tsvector('pg_catalog.english',
            coalesce(NEW.title, '') || ' ' || coalesce(NEW.body_text, ''));
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS search_document_search_vector_trigger ON search_document;
CREATE TRIGGER search_document_search_vector_trigger
    BEFORE INSERT OR UPDATE OF title, body_text ON search_document
    FOR EACH ROW
    EXECUTE FUNCTION search_document_update_search_vector();

-- ===========================================================================
-- 3. Performance indexes
-- ===========================================================================

-- GIN index on payload_json for faceted filter queries (jsonb_path_ops is
-- smaller and faster for containment checks than the default gin_opclass).
CREATE INDEX IF NOT EXISTS idx_search_document_payload_gin
    ON search_document USING GIN (payload_json jsonb_path_ops);

-- Trigram index on body_text for fuzzy content matching (not just title).
CREATE INDEX IF NOT EXISTS idx_search_document_body_trgm
    ON search_document USING GIN (body_text gin_trgm_ops);

-- Composite index on search_user_event for trending and collaborative-filtering
-- queries that filter by tenant + org + index_key + event_type + occurred_at.
CREATE INDEX IF NOT EXISTS idx_search_user_event_tenant_org_index_type_occurred
    ON search_user_event (tenant_id, organization_id, index_key, event_type, occurred_at);

-- Composite index for similar-documents query (document_id + user_id lookup).
CREATE INDEX IF NOT EXISTS idx_search_user_event_document_user
    ON search_user_event (tenant_id, organization_id, document_id, user_id);

-- Index for promotion list_all queries (includes non-active promotions).
CREATE INDEX IF NOT EXISTS idx_search_promotion_index_status_updated
    ON search_promotion (tenant_id, organization_id, index_key, status, updated_at);
