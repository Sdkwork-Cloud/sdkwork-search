import type { RecommendationStrategyType } from './recommendation-strategy-type';
import type { SearchRecommendationItem } from './search-recommendation-item';

export interface SearchRecommendationResponse {
  items: SearchRecommendationItem[];
  strategy: RecommendationStrategyType;
  /** Recommendation computation time in milliseconds. */
  tookMs: number;
}
