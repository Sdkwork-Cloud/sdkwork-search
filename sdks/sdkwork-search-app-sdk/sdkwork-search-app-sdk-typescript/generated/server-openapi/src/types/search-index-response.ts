import type { SearchIndex } from './search-index';

export interface SearchIndexResponse {
  index: SearchIndex;
  /** Server-owned request correlation id. */
  requestId: string;
}
