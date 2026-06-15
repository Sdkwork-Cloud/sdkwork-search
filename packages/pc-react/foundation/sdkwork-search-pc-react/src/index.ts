export interface SdkworkSearchDocument {
  content?: string;
  id: string;
  metadata?: Record<string, unknown>;
  title?: string;
}

export function searchDocuments(
  documents: readonly SdkworkSearchDocument[],
  query: string,
): SdkworkSearchDocument[] {
  const lowerQuery = query.toLowerCase();
  return documents.filter(
    (doc) =>
      doc.title?.toLowerCase().includes(lowerQuery) ||
      doc.content?.toLowerCase().includes(lowerQuery),
  );
}
