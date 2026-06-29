import type { SearchPageInfo } from './search-page-info';
import type { SearchSynonym } from './search-synonym';

export interface SearchSynonymListResponse {
  items: SearchSynonym[];
  pageInfo: SearchPageInfo;
}
