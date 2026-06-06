export interface SearchEmbeddingJobCreateRequest {
  indexId: string;
  documentId?: string;
  provider?: string;
  model?: string;
}
