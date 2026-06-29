import type { SearchPromotionContext } from './search-promotion-context';

export interface SearchPromotionRequest {
  context: SearchPromotionContext;
  limit?: number;
  providerId?: string;
  providerKind?: 'algolia' | 'custom' | 'elasticsearch' | 'meilisearch' | 'memory' | 'opensearch' | 'postgresql' | 'typesense' | 'vector';
}
