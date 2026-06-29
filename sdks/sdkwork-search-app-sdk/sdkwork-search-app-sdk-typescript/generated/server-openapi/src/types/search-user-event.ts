export interface SearchUserEvent {
  documentId?: string;
  eventType: 'click' | 'conversion' | 'dismiss' | 'impression' | 'save' | 'view';
  indexId?: string;
  metadata?: Record<string, unknown>;
  occurredAt: string;
  placement?: string;
  providerId?: string;
  q?: string;
  resultPosition?: number;
  surface: 'app' | 'backend' | 'local';
}
