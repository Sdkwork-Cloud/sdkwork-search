import type { PageInfo } from './page-info';
import type { SearchSuggestion } from './search-suggestion';

export interface SearchSuggestionsListResponse {
  code: 0;
  data: unknown & Record<string, unknown>;
  /** Server-owned request correlation id. */
  traceId: string;
}
