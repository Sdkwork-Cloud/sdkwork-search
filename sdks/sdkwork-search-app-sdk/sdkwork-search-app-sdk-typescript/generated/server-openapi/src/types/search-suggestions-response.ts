import type { SearchSuggestion } from './search-suggestion';

export interface SearchSuggestionsResponse {
  suggestions: SearchSuggestion[];
  /** Suggestion retrieval time in milliseconds. */
  tookMs: number;
}
