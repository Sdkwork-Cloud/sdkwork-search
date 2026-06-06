export interface SearchProviderCreateRequest {
  providerId: string;
  kind: 'algolia' | 'custom' | 'elasticsearch' | 'meilisearch' | 'memory' | 'opensearch' | 'postgresql' | 'typesense' | 'vector';
  displayName: string;
  capabilities: ('analytics' | 'document_indexing' | 'event_ingestion' | 'hybrid_search' | 'lexical_search' | 'promotions' | 'provider_health' | 'ranking_profiles' | 'recommendations' | 'semantic_search' | 'suggestions' | 'synonyms')[];
  defaultFor?: ('analytics' | 'document_indexing' | 'event_ingestion' | 'hybrid_search' | 'lexical_search' | 'promotions' | 'provider_health' | 'ranking_profiles' | 'recommendations' | 'semantic_search' | 'suggestions' | 'synonyms')[];
  /** Non-secret provider configuration such as endpoint, index naming, locale, timeout, routing, and feature flags. */
  config?: Record<string, unknown>;
  /** Provider credential configuration. This field is write-only and must be encrypted or stored through the provider secret store; it is never returned by SearchProvider responses. */
  secretConfig?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
  priority?: number;
  status?: 'active' | 'degraded' | 'disabled' | 'error' | 'unknown';
}
