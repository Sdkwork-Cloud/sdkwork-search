import type { SearchDocument } from './search-document';

export interface SearchDocumentBulkUpsertRequest {
  documents: SearchDocument[];
}
