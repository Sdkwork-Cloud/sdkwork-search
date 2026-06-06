import type { SearchProvider } from './search-provider';

export interface SearchProviderResponse {
  provider: SearchProvider;
  /** Server-owned request correlation id. */
  requestId: string;
}
