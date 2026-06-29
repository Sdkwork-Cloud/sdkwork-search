import type { PageInfo } from './page-info';
import type { SearchRecommendationItem } from './search-recommendation-item';

export interface SearchRecommendationsCreateResponse {
  code: 0;
  data: unknown & Record<string, unknown>;
  /** Server-owned request correlation id. */
  traceId: string;
}
