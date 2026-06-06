export interface SearchRankingProfileCreateRequest {
  profileKey: string;
  title: string;
  weights?: Record<string, unknown>;
  rule?: Record<string, unknown>;
}
