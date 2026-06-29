import type { PageInfo } from './page-info';
import type { SearchRecommendationStrategy } from './search-recommendation-strategy';

export interface SearchRecommendationStrategiesListResponse {
  code: 0;
  data: unknown & Record<string, unknown>;
  /** Server-owned request correlation id. */
  traceId: string;
}
