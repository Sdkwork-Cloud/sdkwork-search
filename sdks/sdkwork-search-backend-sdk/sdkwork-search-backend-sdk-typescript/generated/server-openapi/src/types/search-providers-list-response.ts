import type { PageInfo } from './page-info';
import type { SearchProvider } from './search-provider';

export interface SearchProvidersListResponse {
  code: 0;
  data: unknown & Record<string, unknown>;
  /** Server-owned request correlation id. */
  traceId: string;
}
