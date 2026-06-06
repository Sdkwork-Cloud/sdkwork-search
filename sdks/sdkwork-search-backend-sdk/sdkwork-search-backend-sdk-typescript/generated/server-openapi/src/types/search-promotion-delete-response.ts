export interface SearchPromotionDeleteResponse {
  deleted: boolean;
  promotionId: string;
  /** Server-owned request correlation id. */
  requestId: string;
}
