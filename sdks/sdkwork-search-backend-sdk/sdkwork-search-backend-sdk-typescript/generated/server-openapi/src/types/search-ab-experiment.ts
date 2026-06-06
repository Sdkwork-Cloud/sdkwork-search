export interface SearchAbExperiment {
  experimentId: string;
  experimentKey: string;
  title: string;
  target?: Record<string, unknown>;
  variants?: Record<string, unknown>[];
  status: 'active' | 'archived' | 'draft' | 'paused';
  activeFrom?: string;
  activeUntil?: string;
}
