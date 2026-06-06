import type { SearchEmbeddingJob } from './search-embedding-job';

export interface SearchEmbeddingJobResponse {
  job: SearchEmbeddingJob;
  /** Server-owned request correlation id. */
  requestId: string;
}
