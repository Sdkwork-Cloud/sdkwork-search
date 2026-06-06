export interface SearchEmbeddingJob {
  jobId: string;
  indexId: string;
  documentId?: string;
  provider?: string;
  model?: string;
  status: 'failed' | 'pending' | 'running' | 'succeeded';
  scheduledAt?: string;
  startedAt?: string;
  finishedAt?: string;
  errorSummary?: string;
}
