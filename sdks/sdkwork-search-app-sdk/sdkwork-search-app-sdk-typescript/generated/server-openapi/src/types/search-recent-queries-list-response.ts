import type { PageInfo } from './page-info';
import type { SearchRecentQuery } from './search-recent-query';

export interface SearchRecentQueriesListResponse {
  code: 0;
  data: unknown & Record<string, unknown>;
  /** Server-owned request correlation id. */
  traceId: string;
}
