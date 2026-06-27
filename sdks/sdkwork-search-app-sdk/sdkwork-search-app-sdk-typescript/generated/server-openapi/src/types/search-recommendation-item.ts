export interface SearchRecommendationItem {
  documentId: string;
  /** Recommendation score; higher is more relevant. */
  score: number;
  /** Original document payload. */
  source?: Record<string, unknown>;
  /** Optional human-readable reason for the recommendation. */
  reason?: string | null;
}
