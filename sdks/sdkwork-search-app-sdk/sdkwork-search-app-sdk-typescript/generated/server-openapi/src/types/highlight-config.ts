export interface HighlightConfig {
  /** Fields to generate highlight snippets for. */
  fields: string[];
  preTag?: string;
  postTag?: string;
  /** Maximum number of words per highlight fragment. */
  fragmentSize?: number;
  /** Maximum number of fragments to return per field. */
  maxFragments?: number;
}
