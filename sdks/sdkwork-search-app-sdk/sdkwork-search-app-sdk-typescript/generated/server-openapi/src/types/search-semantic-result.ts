import type { SearchDocument } from './search-document';

export interface SearchSemanticResult {
  document: SearchDocument;
  lexicalScore: number;
  semanticScore?: number;
  reasonCodes: string[];
  score: number;
}
