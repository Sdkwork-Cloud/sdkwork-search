import type { SearchRecommendationItem } from './search-recommendation-item';

export interface SearchRecommendationResponse {
  items: SearchRecommendationItem[];
  strategyId: string;
}
