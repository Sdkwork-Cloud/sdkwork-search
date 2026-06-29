import type { SearchSuggestion } from './search-suggestion';

export interface SearchSuggestionsResponse {
  items: SearchSuggestion[];
  q: string;
}
