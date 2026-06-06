import type { SearchDocument } from './search-document';

export interface SearchDocumentResponse {
  document: SearchDocument;
  indexedAt: string;
  /** Server-owned request correlation id. */
  requestId: string;
}
