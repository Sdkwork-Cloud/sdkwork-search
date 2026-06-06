import type { SearchSynonym } from './search-synonym';

export interface SearchSynonymResponse {
  /** Server-owned request correlation id. */
  requestId: string;
  synonym: SearchSynonym;
}
