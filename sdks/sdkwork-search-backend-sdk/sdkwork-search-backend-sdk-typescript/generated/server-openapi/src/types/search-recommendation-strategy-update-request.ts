export interface SearchRecommendationStrategyUpdateRequest {
  strategyType?: 'collaborative' | 'content' | 'hybrid' | 'popular' | 'semantic';
  title?: string;
  config?: Record<string, unknown>;
  status?: 'active' | 'archived' | 'draft' | 'paused';
}
