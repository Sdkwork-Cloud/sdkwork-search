export interface SearchRecommendationContext {
  q?: string;
  capabilityIds?: string[];
  groupIds?: string[];
  scopeIds?: string[];
  recentDocumentIds?: string[];
  placement?: string;
  userId?: string;
}
