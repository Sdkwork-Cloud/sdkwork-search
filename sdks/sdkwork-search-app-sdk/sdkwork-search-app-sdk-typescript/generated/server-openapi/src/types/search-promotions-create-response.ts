import type { PageInfo } from './page-info';
import type { SearchPromotionItem } from './search-promotion-item';

export interface SearchPromotionsCreateResponse {
  code: 0;
  data: unknown & Record<string, unknown>;
  /** Server-owned request correlation id. */
  traceId: string;
}
