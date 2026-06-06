export interface SearchProvider {
  providerId: string;
  kind: 'algolia' | 'custom' | 'elasticsearch' | 'meilisearch' | 'memory' | 'opensearch' | 'postgresql' | 'typesense' | 'vector';
  displayName: string;
  capabilities: ('analytics' | 'document_indexing' | 'event_ingestion' | 'hybrid_search' | 'lexical_search' | 'promotions' | 'provider_health' | 'ranking_profiles' | 'recommendations' | 'semantic_search' | 'suggestions' | 'synonyms')[];
  defaultFor: ('analytics' | 'document_indexing' | 'event_ingestion' | 'hybrid_search' | 'lexical_search' | 'promotions' | 'provider_health' | 'ranking_profiles' | 'recommendations' | 'semantic_search' | 'suggestions' | 'synonyms')[];
  /** Non-secret provider configuration safe to return in backend API responses. Credentials, API keys, tokens, passwords, private keys, and connection secrets are never returned here. */
  config?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
  priority: number;
  status: 'active' | 'degraded' | 'disabled' | 'error' | 'unknown';
  healthStatus?: 'degraded' | 'healthy' | 'unavailable' | 'unknown';
  lastCheckedAt?: string;
  lastErrorSummary?: string;
  createdAt?: string;
  updatedAt?: string;
}
