import type { SearchDocument } from './search-document';

export interface SearchRecommendationItem {
  document: SearchDocument;
  reasonCodes: string[];
  score: number;
}
