import type { SearchPageInfo } from './search-page-info';
import type { SearchRecommendationStrategy } from './search-recommendation-strategy';

export interface SearchRecommendationStrategyListResponse {
  items: SearchRecommendationStrategy[];
  pageInfo: SearchPageInfo;
}
