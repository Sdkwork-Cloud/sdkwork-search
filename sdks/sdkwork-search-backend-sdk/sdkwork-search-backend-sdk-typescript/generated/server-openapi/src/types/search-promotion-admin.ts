export interface SearchPromotionAdmin {
  promotionId: string;
  placement: string;
  documentId: string;
  indexId?: string;
  priority?: number;
  rule?: Record<string, unknown>;
  status: 'active' | 'archived' | 'draft' | 'paused';
  activeFrom?: string;
  activeUntil?: string;
}
