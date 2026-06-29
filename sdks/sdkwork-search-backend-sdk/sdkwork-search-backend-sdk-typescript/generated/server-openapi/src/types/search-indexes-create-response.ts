import type { SearchIndexResponse } from './search-index-response';

export interface SearchIndexesCreateResponse {
  code: 0;
  data: unknown & Record<string, unknown>;
  /** Server-owned request correlation id. */
  traceId: string;
}
