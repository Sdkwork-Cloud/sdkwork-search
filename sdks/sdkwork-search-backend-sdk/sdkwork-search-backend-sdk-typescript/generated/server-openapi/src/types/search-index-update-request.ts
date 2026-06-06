export interface SearchIndexUpdateRequest {
  name?: string;
  description?: string;
  analyzer?: string;
  status?: 'active' | 'archived' | 'draft' | 'paused';
}
