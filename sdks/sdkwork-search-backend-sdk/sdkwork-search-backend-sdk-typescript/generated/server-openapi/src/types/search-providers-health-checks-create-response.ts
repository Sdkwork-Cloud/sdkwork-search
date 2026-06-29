import type { SearchProviderHealthCheckResponse } from './search-provider-health-check-response';

export interface SearchProvidersHealthChecksCreateResponse {
  code: 0;
  data: unknown & Record<string, unknown>;
  /** Server-owned request correlation id. */
  traceId: string;
}
