export interface SortClause {
  /** Field name to sort by (must be a safe identifier: alphanumeric + underscore). */
  field: string;
  order: 'asc' | 'desc';
}
