export interface SearchSynonymCreateRequest {
  setKey: string;
  term: string;
  synonyms: string[];
  matchType?: 'equivalent' | 'one_way';
}
