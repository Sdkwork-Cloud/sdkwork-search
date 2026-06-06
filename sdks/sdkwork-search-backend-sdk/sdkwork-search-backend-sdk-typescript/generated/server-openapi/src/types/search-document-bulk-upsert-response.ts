export interface SearchDocumentBulkUpsertResponse {
  indexedAt: string;
  /** Server-owned request correlation id. */
  requestId: string;
  upsertedCount: number;
}
