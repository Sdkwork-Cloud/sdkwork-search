import type { SearchUserEventResponse } from './search-user-event-response';

export interface SearchEventsCreateResponse {
  code: 0;
  data: unknown & Record<string, unknown>;
  /** Server-owned request correlation id. */
  traceId: string;
}
