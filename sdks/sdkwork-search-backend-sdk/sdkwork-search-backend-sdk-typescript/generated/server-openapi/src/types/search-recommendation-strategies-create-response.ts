import type { SearchRecommendationStrategyResponse } from './search-recommendation-strategy-response';

export interface SearchRecommendationStrategiesCreateResponse {
  code: 0;
  data: unknown & Record<string, unknown>;
  /** Server-owned request correlation id. */
  traceId: string;
}
