import type { SearchAnalyticsOverview } from './search-analytics-overview';

export interface SearchAnalyticsOverviewRetrieveResponse {
  code: 0;
  data: unknown & Record<string, unknown>;
  /** Server-owned request correlation id. */
  traceId: string;
}
