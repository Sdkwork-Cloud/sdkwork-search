export interface SearchQueryRequest {
  q: string;
  page?: number;
  pageSize?: number;
  providerId?: string;
  providerKind?: 'algolia' | 'custom' | 'elasticsearch' | 'meilisearch' | 'memory' | 'opensearch' | 'postgresql' | 'typesense' | 'vector';
  capabilityIds?: string[];
  groupIds?: string[];
  scopeIds?: string[];
}
