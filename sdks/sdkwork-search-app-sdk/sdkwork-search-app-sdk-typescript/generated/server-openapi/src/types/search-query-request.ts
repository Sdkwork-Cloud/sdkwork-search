import type { HighlightConfig } from './highlight-config';
import type { SortClause } from './sort-clause';

export interface SearchQueryRequest {
  /** Target index key to search within. */
  indexKey: string;
  /** Free-text query (supports websearch syntax: AND, OR, NOT, "phrase"). */
  q: string;
  page?: number;
  pageSize?: number;
  /** Structured filters: field name -> list of accepted values (OR within a field). */
  filters?: Record<string, string[]>;
  /** Facet field names to aggregate counts for. */
  facets?: string[];
  /** Sort clauses applied in order; absent fields default to relevance rank. */
  sort?: SortClause[];
  /** Highlight configuration; when omitted, no highlight snippets are returned. */
  highlight?: HighlightConfig;
  /** Minimum relevance score threshold; hits below this value are filtered out. */
  minScore?: number;
  /** Query timeout in milliseconds; partial results are returned on timeout. */
  timeoutMs?: number;
}
