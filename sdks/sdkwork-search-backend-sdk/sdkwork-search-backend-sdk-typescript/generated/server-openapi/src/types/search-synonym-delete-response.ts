export interface SearchSynonymDeleteResponse {
  deleted: boolean;
  /** Server-owned request correlation id. */
  requestId: string;
  synonymId: string;
}
