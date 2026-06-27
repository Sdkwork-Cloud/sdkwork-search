import type { RecommendationStrategyType } from './recommendation-strategy-type';

export interface SearchRecommendationRequest {
  /** Target user id (string form of i64) for personalized recommendations. */
  userId: string;
  /** Index key to recommend documents from. */
  indexKey: string;
  strategy: RecommendationStrategyType;
  limit?: number;
}
