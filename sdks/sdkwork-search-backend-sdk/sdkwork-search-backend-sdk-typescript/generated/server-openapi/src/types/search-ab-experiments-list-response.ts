import type { PageInfo } from './page-info';
import type { SearchAbExperiment } from './search-ab-experiment';

export interface SearchAbExperimentsListResponse {
  code: 0;
  data: unknown & Record<string, unknown>;
  /** Server-owned request correlation id. */
  traceId: string;
}
