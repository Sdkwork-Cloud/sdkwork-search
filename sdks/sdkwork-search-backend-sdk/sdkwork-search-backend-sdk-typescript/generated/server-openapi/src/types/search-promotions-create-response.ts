import type { SearchPromotionAdminResponse } from './search-promotion-admin-response';

export interface SearchPromotionsCreateResponse {
  code: 0;
  data: unknown & Record<string, unknown>;
  /** Server-owned request correlation id. */
  traceId: string;
}
