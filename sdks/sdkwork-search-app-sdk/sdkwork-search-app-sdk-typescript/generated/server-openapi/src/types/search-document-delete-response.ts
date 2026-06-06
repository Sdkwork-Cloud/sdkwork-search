export interface SearchDocumentDeleteResponse {
  indexId: string;
  documentId: string;
  deleted: boolean;
  /** Server-owned request correlation id. */
  requestId: string;
}
