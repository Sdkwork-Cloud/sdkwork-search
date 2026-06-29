import type { SearchAbExperiment } from './search-ab-experiment';
import type { SearchPageInfo } from './search-page-info';

export interface SearchAbExperimentListResponse {
  items: SearchAbExperiment[];
  pageInfo: SearchPageInfo;
}
