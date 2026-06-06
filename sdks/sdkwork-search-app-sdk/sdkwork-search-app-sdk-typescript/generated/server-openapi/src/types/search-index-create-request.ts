export interface SearchIndexCreateRequest {
  indexId: string;
  name: string;
  description?: string;
  analyzer?: string;
}
