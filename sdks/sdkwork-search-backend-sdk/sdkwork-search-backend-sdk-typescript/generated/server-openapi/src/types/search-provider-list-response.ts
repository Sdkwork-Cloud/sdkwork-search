import type { SearchPageInfo } from './search-page-info';
import type { SearchProvider } from './search-provider';

export interface SearchProviderListResponse {
  items: SearchProvider[];
  pageInfo: SearchPageInfo;
  /** Server-owned request correlation id. */
  requestId: string;
}
