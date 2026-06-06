import type { SearchPageInfo } from './search-page-info';
import type { SearchRankingProfile } from './search-ranking-profile';

export interface SearchRankingProfileListResponse {
  items: SearchRankingProfile[];
  pageInfo: SearchPageInfo;
  /** Server-owned request correlation id. */
  requestId: string;
}
