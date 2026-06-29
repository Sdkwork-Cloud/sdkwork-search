import type { SearchAbExperimentResponse } from './search-ab-experiment-response';

export interface SearchAbExperimentsCreateResponse {
  code: 0;
  data: unknown & Record<string, unknown>;
  /** Server-owned request correlation id. */
  traceId: string;
}
