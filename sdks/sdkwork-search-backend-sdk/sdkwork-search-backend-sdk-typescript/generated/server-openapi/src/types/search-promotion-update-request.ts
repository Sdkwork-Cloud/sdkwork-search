export interface SearchPromotionUpdateRequest {
  priority?: number;
  rule?: Record<string, unknown>;
  status?: 'active' | 'archived' | 'draft' | 'paused';
  activeFrom?: string;
  activeUntil?: string;
}
