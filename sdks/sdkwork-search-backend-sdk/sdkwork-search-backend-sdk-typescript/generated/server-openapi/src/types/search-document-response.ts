import type { SearchDocument } from './search-document';

export interface SearchDocumentResponse {
  document: SearchDocument;
  indexedAt: string;
}
