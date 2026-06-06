export interface SearchAbAssignmentResponse {
  assignedAt: string;
  experimentId: string;
  /** Server-owned request correlation id. */
  requestId: string;
  subjectId: string;
  variantKey: string;
}
