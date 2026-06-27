export interface SearchSuggestion {
  text: string;
  /** Similarity score; higher is more relevant. */
  score: number;
  /** Optional metadata associated with the suggestion. */
  payload?: Record<string, unknown> | null;
}
