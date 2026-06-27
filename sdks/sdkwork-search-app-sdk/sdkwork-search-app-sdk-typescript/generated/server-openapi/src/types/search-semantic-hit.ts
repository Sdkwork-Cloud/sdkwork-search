export interface SearchSemanticHit {
  documentId: string;
  /** Semantic similarity score (1 - cosine distance). */
  score: number;
  /** Original document payload. */
  source?: Record<string, unknown>;
}
