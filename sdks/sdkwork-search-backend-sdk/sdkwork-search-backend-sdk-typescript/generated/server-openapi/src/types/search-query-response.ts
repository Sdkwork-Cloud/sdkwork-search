import type { SearchPageInfo } from './search-page-info';
import type { SearchResult } from './search-result';

export interface SearchQueryResponse {
  items: SearchResult[];
  pageInfo: SearchPageInfo;
  q: string;
  /** Server-owned request correlation id. */
  requestId: string;
}
