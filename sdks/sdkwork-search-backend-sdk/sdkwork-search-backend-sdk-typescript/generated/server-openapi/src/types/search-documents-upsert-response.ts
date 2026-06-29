import type { SearchDocumentResponse } from './search-document-response';

export interface SearchDocumentsUpsertResponse {
  code: 0;
  data: unknown & Record<string, unknown>;
  /** Server-owned request correlation id. */
  traceId: string;
}
