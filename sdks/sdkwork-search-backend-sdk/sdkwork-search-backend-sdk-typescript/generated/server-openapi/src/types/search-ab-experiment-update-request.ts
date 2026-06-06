export interface SearchAbExperimentUpdateRequest {
  title?: string;
  target?: Record<string, unknown>;
  variants?: Record<string, unknown>[];
  status?: 'active' | 'archived' | 'draft' | 'paused';
  activeFrom?: string;
  activeUntil?: string;
}
