import type { PageInfo } from './page-info';
import type { SearchSynonym } from './search-synonym';

export interface SearchSynonymsListResponse {
  code: 0;
  data: unknown & Record<string, unknown>;
  /** Server-owned request correlation id. */
  traceId: string;
}
