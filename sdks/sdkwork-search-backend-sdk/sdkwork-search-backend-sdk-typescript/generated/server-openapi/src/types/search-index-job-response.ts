export interface SearchIndexJobResponse {
  jobId: string;
  status: 'failed' | 'pending' | 'running' | 'succeeded';
}
