import type { PageInfo } from './page-info';
import type { SearchPromotionAdmin } from './search-promotion-admin';

export interface SearchPromotionsListResponse {
  code: 0;
  data: unknown & Record<string, unknown>;
  /** Server-owned request correlation id. */
  traceId: string;
}
