import type { SearchRecommendationItem } from './search-recommendation-item';

export interface SearchRecommendationResponse {
  items: SearchRecommendationItem[];
  /** Server-owned request correlation id. */
  requestId: string;
  strategyId: string;
}
