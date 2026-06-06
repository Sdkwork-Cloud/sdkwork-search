import type { SearchProviderHealthCheck } from './search-provider-health-check';

export interface SearchProviderHealthCheckResponse {
  healthCheck: SearchProviderHealthCheck;
  /** Server-owned request correlation id. */
  requestId: string;
}
