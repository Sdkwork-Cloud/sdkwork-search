import type { SearchSynonymResponse } from './search-synonym-response';

export interface SearchSynonymsCreateResponse {
  code: 0;
  data: unknown & Record<string, unknown>;
  /** Server-owned request correlation id. */
  traceId: string;
}
