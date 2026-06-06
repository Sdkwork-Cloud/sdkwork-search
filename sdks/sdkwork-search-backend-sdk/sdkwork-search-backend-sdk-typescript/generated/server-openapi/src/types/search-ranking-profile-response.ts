import type { SearchRankingProfile } from './search-ranking-profile';

export interface SearchRankingProfileResponse {
  profile: SearchRankingProfile;
  /** Server-owned request correlation id. */
  requestId: string;
}
