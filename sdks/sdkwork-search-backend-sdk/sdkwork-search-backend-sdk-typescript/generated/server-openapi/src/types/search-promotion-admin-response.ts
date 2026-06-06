import type { SearchPromotionAdmin } from './search-promotion-admin';

export interface SearchPromotionAdminResponse {
  promotion: SearchPromotionAdmin;
  /** Server-owned request correlation id. */
  requestId: string;
}
