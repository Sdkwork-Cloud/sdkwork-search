import type { SearchDocumentBulkUpsertResponse } from './search-document-bulk-upsert-response';

export interface SearchDocumentsBulkUpsertResponse {
  code: 0;
  data: unknown & Record<string, unknown>;
  /** Server-owned request correlation id. */
  traceId: string;
}
