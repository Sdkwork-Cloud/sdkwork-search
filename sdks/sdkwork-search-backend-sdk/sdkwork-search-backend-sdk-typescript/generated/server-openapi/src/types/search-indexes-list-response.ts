import type { PageInfo } from './page-info';
import type { SearchIndex } from './search-index';

export interface SearchIndexesListResponse {
  code: 0;
  data: unknown & Record<string, unknown>;
  /** Server-owned request correlation id. */
  traceId: string;
}
