export interface SearchRankingProfileUpdateRequest {
  title?: string;
  weights?: Record<string, unknown>;
  rule?: Record<string, unknown>;
  status?: 'active' | 'archived' | 'draft' | 'paused';
}
