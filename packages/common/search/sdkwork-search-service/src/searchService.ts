import {
  createSdkworkSearchCatalog,
  createSdkworkSearchQueryResponse,
  type SdkworkSearchDocument,
  type SdkworkSearchQueryRequest,
  type SdkworkSearchQueryResponse,
} from "@sdkwork/search-contracts";

export interface SdkworkSearchAppSdkClient {
  search: {
    queries: {
      create(body: SdkworkSearchAppQueryBody): Promise<SdkworkSearchQueryResponse>;
    };
  };
}

export interface SdkworkSearchBackendSdkClient {
  search: {
    documents: {
      upsert(
        indexId: string,
        body: SdkworkSearchBackendDocumentUpsertBody,
      ): Promise<SdkworkSearchBackendDocumentUpsertResponse>;
    };
  };
}

export interface SdkworkSearchAppQueryBody extends SdkworkSearchQueryRequest {
  q: string;
}

export interface SdkworkSearchBackendDocumentUpsertBody {
  document: SdkworkSearchDocument;
}

export interface SdkworkSearchBackendDocumentUpsertResponse {
  document: SdkworkSearchDocument;
  indexedAt: string;
  requestId: string;
}

export interface CreateSdkworkSearchServiceOptions {
  appClient?: SdkworkSearchAppSdkClient;
  backendClient?: SdkworkSearchBackendSdkClient;
  localDocuments?: readonly SdkworkSearchDocument[];
  requestIdFactory?: () => string;
}

export interface SdkworkSearchService {
  query(request: SdkworkSearchQueryRequest): Promise<SdkworkSearchQueryResponse>;
  upsertDocument(
    indexId: string,
    document: SdkworkSearchDocument,
  ): Promise<SdkworkSearchBackendDocumentUpsertResponse>;
}

function createDefaultRequestId(): string {
  return `local-search-${Date.now().toString(36)}`;
}

export function createSdkworkSearchService({
  appClient,
  backendClient,
  localDocuments = [],
  requestIdFactory = createDefaultRequestId,
}: CreateSdkworkSearchServiceOptions = {}): SdkworkSearchService {
  return {
    async query(request) {
      const q = request.q ?? "";

      if (appClient) {
        return appClient.search.queries.create({
          ...request,
          q,
        });
      }

      return createSdkworkSearchQueryResponse(
        createSdkworkSearchCatalog(localDocuments),
        {
          ...request,
          q,
          requestId: request.requestId ?? requestIdFactory(),
        },
      );
    },

    async upsertDocument(indexId, document) {
      if (!backendClient) {
        throw new Error("Missing search backend SDK client");
      }

      return backendClient.search.documents.upsert(indexId, {
        document,
      });
    },
  };
}

export const createSearchService = createSdkworkSearchService;
