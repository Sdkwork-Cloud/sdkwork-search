import type { SearchSemanticResult } from './search-semantic-result';

export interface SearchSemanticQueryResponse {
  embeddingProvider: string;
  items: SearchSemanticResult[];
  mode: 'hybrid' | 'semantic';
  q: string;
  /** Server-owned request correlation id. */
  requestId: string;
  semanticProfileId: string;
}
