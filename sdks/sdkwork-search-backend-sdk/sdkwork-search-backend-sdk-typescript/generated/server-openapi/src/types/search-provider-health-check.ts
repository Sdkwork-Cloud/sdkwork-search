export interface SearchProviderHealthCheck {
  providerId: string;
  status: 'degraded' | 'healthy' | 'unavailable' | 'unknown';
  checkedAt: string;
  latencyMs?: number;
  details?: Record<string, unknown>;
  errorSummary?: string;
}
