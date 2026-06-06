export interface SearchRecommendationStrategyCreateRequest {
  strategyKey: string;
  strategyType?: 'collaborative' | 'content' | 'hybrid' | 'popular' | 'semantic';
  title: string;
  config?: Record<string, unknown>;
}
