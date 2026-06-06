export interface SearchIndexDeleteResponse {
  deleted: boolean;
  indexId: string;
  /** Server-owned request correlation id. */
  requestId: string;
}
