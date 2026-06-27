export interface SearchUserEvent {
  /** Event kind (e.g. view, click, conversion). */
  eventType: string;
  indexId?: string | null;
  documentId?: string | null;
  queryText?: string | null;
  resultPosition?: number | null;
  metadata?: Record<string, unknown> | null;
}
