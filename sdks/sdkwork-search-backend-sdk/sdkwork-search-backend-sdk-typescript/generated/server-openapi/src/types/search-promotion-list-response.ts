import type { SearchPageInfo } from './search-page-info';
import type { SearchPromotionAdmin } from './search-promotion-admin';

export interface SearchPromotionListResponse {
  items: SearchPromotionAdmin[];
  pageInfo: SearchPageInfo;
}
