import type { PageInfo } from './page-info';
import type { SearchSemanticResult } from './search-semantic-result';

export interface SearchSemanticQueriesCreateResponse {
  code: 0;
  data: unknown & Record<string, unknown>;
  /** Server-owned request correlation id. */
  traceId: string;
}
