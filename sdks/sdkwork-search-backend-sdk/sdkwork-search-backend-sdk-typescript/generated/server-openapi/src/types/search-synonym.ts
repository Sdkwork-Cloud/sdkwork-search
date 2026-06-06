export interface SearchSynonym {
  synonymId: string;
  setKey: string;
  term: string;
  synonyms: string[];
  matchType?: 'equivalent' | 'one_way';
  status: 'active' | 'archived' | 'draft' | 'paused';
}
