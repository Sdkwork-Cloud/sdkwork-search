import type { SearchAbExperiment } from './search-ab-experiment';

export interface SearchAbExperimentResponse {
  experiment: SearchAbExperiment;
  /** Server-owned request correlation id. */
  requestId: string;
}
