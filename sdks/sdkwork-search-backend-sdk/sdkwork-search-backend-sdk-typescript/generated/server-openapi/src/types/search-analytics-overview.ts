export interface SearchAnalyticsOverview {
  /** Decimal ratio serialized as string for SDK precision safety. */
  clickThroughRate: string;
  failedEmbeddingJobs: number;
  indexedDocuments: number;
  promotionClicks: number;
  recommendationClicks: number;
  /** Server-owned request correlation id. */
  requestId: string;
  searchQueries: number;
}
