export interface SearchIndexJobResponse {
  jobId: string;
  /** Server-owned request correlation id. */
  requestId: string;
  status: 'failed' | 'pending' | 'running' | 'succeeded';
}
