import type { SearchPromotionItem } from './search-promotion-item';

export interface SearchPromotionResponse {
  items: SearchPromotionItem[];
  placement: string;
  /** Server-owned request correlation id. */
  requestId: string;
}
