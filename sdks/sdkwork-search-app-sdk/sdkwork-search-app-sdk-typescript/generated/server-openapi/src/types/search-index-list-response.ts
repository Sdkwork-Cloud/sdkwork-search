import type { SearchIndex } from './search-index';
import type { SearchPageInfo } from './search-page-info';

export interface SearchIndexListResponse {
  items: SearchIndex[];
  pageInfo: SearchPageInfo;
}
