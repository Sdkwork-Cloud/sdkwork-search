import type { SearchEmbeddingJob } from './search-embedding-job';
import type { SearchPageInfo } from './search-page-info';

export interface SearchEmbeddingJobListResponse {
  items: SearchEmbeddingJob[];
  pageInfo: SearchPageInfo;
  /** Server-owned request correlation id. */
  requestId: string;
}
