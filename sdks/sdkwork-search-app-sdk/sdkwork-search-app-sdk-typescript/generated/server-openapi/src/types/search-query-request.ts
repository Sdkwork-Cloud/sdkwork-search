export interface SearchQueryRequest {
  q: string;
  page?: number;
  pageSize?: number;
  capabilityIds?: string[];
  groupIds?: string[];
  scopeIds?: string[];
}
