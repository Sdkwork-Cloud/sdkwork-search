export interface SearchRecommendationStrategy {
  strategyId: string;
  strategyKey: string;
  strategyType: 'collaborative' | 'content' | 'hybrid' | 'popular' | 'semantic';
  title: string;
  config?: Record<string, unknown>;
  status: 'active' | 'archived' | 'draft' | 'paused';
}
