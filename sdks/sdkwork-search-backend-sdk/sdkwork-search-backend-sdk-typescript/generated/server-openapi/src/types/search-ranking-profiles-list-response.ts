import type { PageInfo } from './page-info';
import type { SearchRankingProfile } from './search-ranking-profile';

export interface SearchRankingProfilesListResponse {
  code: 0;
  data: unknown & Record<string, unknown>;
  /** Server-owned request correlation id. */
  traceId: string;
}
