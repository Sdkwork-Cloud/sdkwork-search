import type { SearchRankingProfileResponse } from './search-ranking-profile-response';

export interface SearchRankingProfilesCreateResponse {
  code: 0;
  data: unknown & Record<string, unknown>;
  /** Server-owned request correlation id. */
  traceId: string;
}
