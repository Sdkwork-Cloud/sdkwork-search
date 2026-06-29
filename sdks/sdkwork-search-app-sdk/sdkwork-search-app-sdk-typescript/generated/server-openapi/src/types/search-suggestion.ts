export interface SearchSuggestion {
  text: string;
  source: 'document' | 'query';
  score: number;
}
