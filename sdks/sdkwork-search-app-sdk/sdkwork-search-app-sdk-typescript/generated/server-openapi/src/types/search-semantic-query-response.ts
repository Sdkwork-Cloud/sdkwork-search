import type { SearchSemanticResult } from './search-semantic-result';

export interface SearchSemanticQueryResponse {
  embeddingProvider: string;
  items: SearchSemanticResult[];
  mode: 'hybrid' | 'semantic';
  q: string;
  semanticProfileId: string;
}
