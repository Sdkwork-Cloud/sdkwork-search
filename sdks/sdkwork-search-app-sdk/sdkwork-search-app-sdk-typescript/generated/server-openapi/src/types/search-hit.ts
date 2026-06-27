export interface SearchHit {
  documentId: string;
  /** Relevance score; higher is more relevant. */
  score: number;
  /** Original document payload (includes title and indexed fields). */
  source?: Record<string, unknown>;
  /** Highlight snippets: field name -> list of highlighted fragments. */
  highlight?: Record<string, string[]>;
  /** Index key the hit belongs to (useful for cross-index search). */
  indexKey?: string | null;
}
