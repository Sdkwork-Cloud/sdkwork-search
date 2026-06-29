export interface SearchIndex {
  indexId: string;
  name: string;
  description?: string;
  analyzer?: string;
  documentCount: number;
  createdAt: string;
  updatedAt: string;
}
