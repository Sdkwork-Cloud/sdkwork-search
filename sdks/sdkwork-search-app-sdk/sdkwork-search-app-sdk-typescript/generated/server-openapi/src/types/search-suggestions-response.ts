import type { SearchSuggestion } from './search-suggestion';

export interface SearchSuggestionsResponse {
  items: SearchSuggestion[];
  q: string;
  /** Server-owned request correlation id. */
  requestId: string;
}
