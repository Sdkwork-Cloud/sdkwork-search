export interface SearchRankingProfile {
  profileId: string;
  profileKey: string;
  title: string;
  weights?: Record<string, unknown>;
  rule?: Record<string, unknown>;
  status: 'active' | 'archived' | 'draft' | 'paused';
}
