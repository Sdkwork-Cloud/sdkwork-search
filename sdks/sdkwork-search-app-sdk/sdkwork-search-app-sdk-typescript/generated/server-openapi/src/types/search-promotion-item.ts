import type { SearchDocument } from './search-document';

export interface SearchPromotionItem {
  document: SearchDocument;
  placement: string;
  reasonCodes: string[];
  score: number;
}
