import type { SearchRecommendationStrategy } from './search-recommendation-strategy';

export interface SearchRecommendationStrategyResponse {
  /** Server-owned request correlation id. */
  requestId: string;
  strategy: SearchRecommendationStrategy;
}
