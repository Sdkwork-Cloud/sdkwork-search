import type { SearchRecommendationContext } from './search-recommendation-context';

export interface SearchRecommendationRequest {
  context?: SearchRecommendationContext;
  limit?: number;
  providerId?: string;
  providerKind?: 'algolia' | 'custom' | 'elasticsearch' | 'meilisearch' | 'memory' | 'opensearch' | 'postgresql' | 'typesense' | 'vector';
  strategyId?: string;
}
