import type { SearchDocument } from './search-document';

export interface SearchResult {
  document: SearchDocument;
  matchedOn: 'title' | 'keyword' | 'description' | 'group' | 'scope';
  score: number;
}
