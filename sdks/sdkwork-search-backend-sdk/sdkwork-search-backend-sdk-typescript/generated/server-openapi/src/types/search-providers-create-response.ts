import type { SearchProviderResponse } from './search-provider-response';

export interface SearchProvidersCreateResponse {
  code: 0;
  data: unknown & Record<string, unknown>;
  /** Server-owned request correlation id. */
  traceId: string;
}
