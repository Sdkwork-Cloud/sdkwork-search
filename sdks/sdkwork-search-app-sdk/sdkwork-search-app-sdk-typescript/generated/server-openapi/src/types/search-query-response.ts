import type { FacetBucket } from './facet-bucket';
import type { SearchHit } from './search-hit';

export interface SearchQueryResponse {
  /** True total count of matching documents (independent of pagination). */
  total: number;
  hits: SearchHit[];
  /** Facet aggregations: field name -> list of value/count buckets. */
  facets?: Record<string, FacetBucket[]>;
  /** Query execution time in milliseconds. */
  tookMs: number;
  /** Maximum relevance score among the returned hits; null when no hits. */
  maxScore?: number | null;
  /** Server-owned request correlation id. */
  requestId?: string;
}
