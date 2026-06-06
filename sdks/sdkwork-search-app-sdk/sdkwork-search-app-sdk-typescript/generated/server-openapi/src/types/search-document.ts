export interface SearchDocument {
  id: string;
  title: string;
  description?: string;
  enabled?: boolean;
  group?: string;
  groupOrder?: number;
  order?: number;
  keywords?: string[];
  kind?: string;
  capability?: string;
  scope?: string;
  source?: string;
  metadata?: Record<string, unknown>;
  updatedAt?: string;
}
