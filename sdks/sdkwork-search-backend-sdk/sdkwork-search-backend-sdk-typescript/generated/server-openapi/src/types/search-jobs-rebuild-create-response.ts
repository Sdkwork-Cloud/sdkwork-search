import type { SearchIndexJobResponse } from './search-index-job-response';

export interface SearchJobsRebuildCreateResponse {
  code: 0;
  data: unknown & Record<string, unknown>;
  /** Server-owned request correlation id. */
  traceId: string;
}
