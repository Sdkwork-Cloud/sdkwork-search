export interface SearchSemanticQueryRequest {
  /** Target index key for semantic search. */
  indexKey: string;
  /** Query text for lexical fallback and embedding generation. */
  q: string;
  /** Pre-computed query embedding vector; if empty, the server generates one from q. */
  queryEmbedding?: number[];
  /** Number of top results to return. */
  topK?: number;
  filters?: Record<string, string[]>;
  /** Minimum semantic similarity score threshold. */
  minScore?: number;
  timeoutMs?: number;
}
