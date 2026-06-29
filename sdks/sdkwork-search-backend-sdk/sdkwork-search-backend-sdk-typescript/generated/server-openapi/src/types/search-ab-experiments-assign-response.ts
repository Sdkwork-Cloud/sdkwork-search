import type { SearchAbAssignmentResponse } from './search-ab-assignment-response';

export interface SearchAbExperimentsAssignResponse {
  code: 0;
  data: unknown & Record<string, unknown>;
  /** Server-owned request correlation id. */
  traceId: string;
}
