import type { SearchSemanticHit } from './search-semantic-hit';

export interface SearchSemanticQueryResponse {
  hits: SearchSemanticHit[];
  /** Semantic search execution time in milliseconds. */
  tookMs: number;
}
