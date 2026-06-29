import type { PageInfo } from './page-info';
import type { SearchEmbeddingJob } from './search-embedding-job';

export interface SearchEmbeddingJobsListResponse {
  code: 0;
  data: unknown & Record<string, unknown>;
  /** Server-owned request correlation id. */
  traceId: string;
}
