export interface SearchPromotionCreateRequest {
  documentId: string;
  indexId?: string;
  placement: string;
  priority?: number;
  rule?: Record<string, unknown>;
  activeFrom?: string;
  activeUntil?: string;
}
