export interface SearchSemanticQueryRequest {
  q: string;
  embeddingProvider?: string;
  limit?: number;
  providerId?: string;
  providerKind?: 'algolia' | 'custom' | 'elasticsearch' | 'meilisearch' | 'memory' | 'opensearch' | 'postgresql' | 'typesense' | 'vector';
  semanticProfileId?: string;
  capabilityIds?: string[];
  groupIds?: string[];
  scopeIds?: string[];
}
