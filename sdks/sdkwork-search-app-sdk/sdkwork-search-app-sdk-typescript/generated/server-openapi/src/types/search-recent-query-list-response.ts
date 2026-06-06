import type { SearchRecentQuery } from './search-recent-query';

export interface SearchRecentQueryListResponse {
  items: SearchRecentQuery[];
  /** Server-owned request correlation id. */
  requestId: string;
}
