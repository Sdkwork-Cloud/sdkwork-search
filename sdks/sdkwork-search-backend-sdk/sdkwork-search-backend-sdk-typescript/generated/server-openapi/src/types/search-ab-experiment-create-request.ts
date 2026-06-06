export interface SearchAbExperimentCreateRequest {
  experimentKey: string;
  title: string;
  target?: Record<string, unknown>;
  variants: Record<string, unknown>[];
  activeFrom?: string;
  activeUntil?: string;
}
