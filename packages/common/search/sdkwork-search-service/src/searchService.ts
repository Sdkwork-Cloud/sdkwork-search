import {
  createSdkworkSearchIndexSyncPlan,
  createSdkworkSearchCatalog,
  createSdkworkPromotionResponse,
  createSdkworkRecommendationResponse,
  createSdkworkSearchQueryResponse,
  createSdkworkSemanticSearchQueryResponse,
  createSdkworkSearchSuggestionsResponse,
  normalizeSdkworkSearchUserEvent,
  normalizeSdkworkSearchProviderManifest,
  selectSdkworkSearchProvider,
  SDKWORK_POSTGRESQL_SEARCH_PROVIDER_MANIFEST,
  type SdkworkRecommendationStrategyInput,
  type SdkworkSearchDocument,
  type SdkworkSearchIndexDefinitionInput,
  type SdkworkSearchIndexSyncMode,
  type SdkworkSearchIndexSyncPlanOptions,
  type SdkworkSearchIndexSyncResponse,
  type SdkworkPromotionRequest,
  type SdkworkPromotionResponse,
  type SdkworkRecommendationRequest,
  type SdkworkRecommendationResponse,
  type SdkworkSearchProviderCapability,
  type SdkworkSearchProviderHealthCheck,
  type SdkworkSearchProviderKind,
  type SdkworkSearchProviderManifest,
  type SdkworkSearchQueryRequest,
  type SdkworkSearchQueryResponse,
  type SdkworkSearchSuggestionsRequest,
  type SdkworkSearchSuggestionsResponse,
  type SdkworkSearchUserEvent,
  type SdkworkSearchUserEventResponse,
  type SdkworkSemanticSearchQueryRequest,
  type SdkworkSemanticSearchQueryResponse,
} from "@sdkwork/search-contracts";
import { defaultIfBlank } from "@sdkwork/utils";

export interface SdkworkSearchAppSdkClient {
  search: {
    events?: {
      create(body: SdkworkSearchUserEvent): Promise<SdkworkSearchUserEventResponse>;
    };
    promotions?: {
      create(body: SdkworkPromotionRequest): Promise<SdkworkPromotionResponse>;
    };
    queries: {
      create(body: SdkworkSearchAppQueryBody): Promise<SdkworkSearchQueryResponse>;
    };
    recommendations?: {
      create(body: SdkworkRecommendationRequest): Promise<SdkworkRecommendationResponse>;
    };
    suggestions?: {
      list(params?: SdkworkSearchSuggestionsRequest): Promise<SdkworkSearchSuggestionsResponse>;
    };
  };
}

export interface SdkworkSearchBackendSdkClient {
  search: {
    documents: {
      bulkUpsert?(
        indexId: string,
        body: SdkworkSearchBackendDocumentBulkUpsertBody,
        params?: {
          idempotencyKey?: string;
        },
      ): Promise<SdkworkSearchBackendDocumentBulkUpsertResponse>;
      upsert(
        indexId: string,
        documentId: string,
        body: SdkworkSearchBackendDocumentUpsertBody,
      ): Promise<SdkworkSearchBackendDocumentUpsertResponse>;
    };
    promotions?: {
      create(body: SdkworkPromotionCreateRequest): Promise<SdkworkPromotionCreateResponse>;
    };
  };
}

export interface SdkworkSearchAppQueryBody extends SdkworkSearchQueryRequest {
  q: string;
}

export interface SdkworkSearchBackendDocumentUpsertBody {
  document: SdkworkSearchDocument;
}

export interface SdkworkSearchBackendDocumentBulkUpsertBody {
  documents: SdkworkSearchDocument[];
}

export interface SdkworkSearchBackendDocumentUpsertResponse {
  document: SdkworkSearchDocument;
  indexedAt: string;
  requestId: string;
}

export interface SdkworkSearchBackendDocumentBulkUpsertResponse {
  indexedAt: string;
  requestId: string;
  upsertedCount: number;
}

export interface SdkworkPromotionCreateRequest {
  activeFrom?: string;
  activeUntil?: string;
  documentId: string;
  placement: string;
  priority?: number;
  rule?: Record<string, unknown>;
}

export interface SdkworkPromotionRecord extends SdkworkPromotionCreateRequest {
  promotionId: string;
  status: "active" | "archived" | "draft" | "paused";
}

export interface SdkworkPromotionCreateResponse {
  promotion: SdkworkPromotionRecord;
  requestId: string;
}

export interface SdkworkSearchProvider {
  checkHealth?: () => Promise<SdkworkSearchProviderHealthCheck>;
  manifest: SdkworkSearchProviderManifest;
  promote?: (request: SdkworkPromotionRequest) => Promise<SdkworkPromotionResponse>;
  query?: (request: SdkworkSearchQueryRequest) => Promise<SdkworkSearchQueryResponse>;
  recommend?: (request: SdkworkRecommendationRequest) => Promise<SdkworkRecommendationResponse>;
  recordEvent?: (event: SdkworkSearchUserEvent) => Promise<SdkworkSearchUserEventResponse>;
  semanticQuery?: (
    request: SdkworkSemanticSearchQueryRequest,
  ) => Promise<SdkworkSemanticSearchQueryResponse>;
  suggest?: (
    request: SdkworkSearchSuggestionsRequest,
  ) => Promise<SdkworkSearchSuggestionsResponse>;
  syncIndex?: (
    index: SdkworkSearchIndexDefinitionInput,
    sourceItems: readonly Record<string, unknown>[],
    options?: SdkworkSearchIndexSyncPlanOptions,
  ) => Promise<SdkworkSearchIndexSyncResponse>;
  upsertDocument?: (
    indexId: string,
    document: SdkworkSearchDocument,
  ) => Promise<SdkworkSearchBackendDocumentUpsertResponse>;
}

export interface SdkworkPostgresqlSearchRepository {
  checkHealth?: () => Promise<SdkworkSearchProviderHealthCheck>;
  promote?: (request: SdkworkPromotionRequest) => Promise<SdkworkPromotionResponse>;
  query?: (request: SdkworkSearchQueryRequest) => Promise<SdkworkSearchQueryResponse>;
  recommend?: (request: SdkworkRecommendationRequest) => Promise<SdkworkRecommendationResponse>;
  recordEvent?: (event: SdkworkSearchUserEvent) => Promise<SdkworkSearchUserEventResponse>;
  semanticQuery?: (
    request: SdkworkSemanticSearchQueryRequest,
  ) => Promise<SdkworkSemanticSearchQueryResponse>;
  suggest?: (
    request: SdkworkSearchSuggestionsRequest,
  ) => Promise<SdkworkSearchSuggestionsResponse>;
  upsertDocument?: (
    indexId: string,
    document: SdkworkSearchDocument,
  ) => Promise<SdkworkSearchBackendDocumentUpsertResponse>;
  syncIndex?: (
    index: SdkworkSearchIndexDefinitionInput,
    sourceItems: readonly Record<string, unknown>[],
    options?: SdkworkSearchIndexSyncPlanOptions,
  ) => Promise<SdkworkSearchIndexSyncResponse>;
}

export interface CreateMemorySearchProviderOptions {
  documents?: readonly SdkworkSearchDocument[];
  providerId?: string;
  providerKind?: SdkworkSearchProviderKind;
  recommendationStrategies?: readonly SdkworkRecommendationStrategyInput[];
  requestIdFactory?: () => string;
}

export interface CreatePostgresqlSearchProviderOptions {
  documents?: readonly SdkworkSearchDocument[];
  providerId?: string;
  recommendationStrategies?: readonly SdkworkRecommendationStrategyInput[];
  repository?: SdkworkPostgresqlSearchRepository;
  requestIdFactory?: () => string;
}

export interface CreateExternalSearchProviderOptions {
  capabilities: readonly SdkworkSearchProviderCapability[];
  checkHealth?: () => Promise<SdkworkSearchProviderHealthCheck>;
  displayName: string;
  kind: Exclude<SdkworkSearchProviderKind, "memory" | "postgresql">;
  metadata?: Record<string, unknown>;
  priority?: number;
  providerId: string;
  promote?: (request: SdkworkPromotionRequest) => Promise<SdkworkPromotionResponse>;
  query?: (request: SdkworkSearchQueryRequest) => Promise<SdkworkSearchQueryResponse>;
  recommend?: (request: SdkworkRecommendationRequest) => Promise<SdkworkRecommendationResponse>;
  recordEvent?: (event: SdkworkSearchUserEvent) => Promise<SdkworkSearchUserEventResponse>;
  semanticQuery?: (
    request: SdkworkSemanticSearchQueryRequest,
  ) => Promise<SdkworkSemanticSearchQueryResponse>;
  status?: SdkworkSearchProviderManifest["status"];
  suggest?: (
    request: SdkworkSearchSuggestionsRequest,
  ) => Promise<SdkworkSearchSuggestionsResponse>;
  syncIndex?: (
    index: SdkworkSearchIndexDefinitionInput,
    sourceItems: readonly Record<string, unknown>[],
    options?: SdkworkSearchIndexSyncPlanOptions,
  ) => Promise<SdkworkSearchIndexSyncResponse>;
  upsertDocument?: (
    indexId: string,
    document: SdkworkSearchDocument,
  ) => Promise<SdkworkSearchBackendDocumentUpsertResponse>;
}

export type CreateSpecificExternalSearchProviderOptions =
  Omit<CreateExternalSearchProviderOptions, "kind">;

export interface CreateSdkworkSearchSolutionSetOptions {
  defaultProvider?: "memory" | "postgresql";
  documents?: readonly SdkworkSearchDocument[];
  externalProviders?: readonly SdkworkSearchProvider[];
  recommendationStrategies?: readonly SdkworkRecommendationStrategyInput[];
  requestIdFactory?: () => string;
}

export interface CreateSdkworkSearchServiceOptions {
  appClient?: SdkworkSearchAppSdkClient;
  backendClient?: SdkworkSearchBackendSdkClient;
  localDocuments?: readonly SdkworkSearchDocument[];
  providers?: readonly SdkworkSearchProvider[];
  recommendationStrategies?: readonly SdkworkRecommendationStrategyInput[];
  requestIdFactory?: () => string;
}

export interface SdkworkSearchService {
  checkProviderHealth(providerId: string): Promise<SdkworkSearchProviderHealthCheck>;
  listProviders(): SdkworkSearchProviderManifest[];
  promote(request: SdkworkPromotionRequest): Promise<SdkworkPromotionResponse>;
  query(request: SdkworkSearchQueryRequest): Promise<SdkworkSearchQueryResponse>;
  recommend(request: SdkworkRecommendationRequest): Promise<SdkworkRecommendationResponse>;
  recordEvent(event: SdkworkSearchUserEvent): Promise<SdkworkSearchUserEventResponse>;
  semanticQuery(request: SdkworkSemanticSearchQueryRequest): Promise<SdkworkSemanticSearchQueryResponse>;
  suggest(request: SdkworkSearchSuggestionsRequest): Promise<SdkworkSearchSuggestionsResponse>;
  syncIndex(
    index: SdkworkSearchIndexDefinitionInput,
    sourceItems: readonly Record<string, unknown>[],
    options?: SdkworkSearchIndexSyncPlanOptions,
  ): Promise<SdkworkSearchIndexSyncResponse>;
  upsertDocument(
    indexId: string,
    document: SdkworkSearchDocument,
  ): Promise<SdkworkSearchBackendDocumentUpsertResponse>;
}

function createDefaultRequestId(): string {
  return `local-search-${Date.now().toString(36)}`;
}

function normalizeProviderKind(
  value: SdkworkSearchProviderKind | undefined,
): SdkworkSearchProviderKind | undefined {
  return value?.trim().toLowerCase() as SdkworkSearchProviderKind | undefined;
}

function createProviderRegistry(
  providers: readonly SdkworkSearchProvider[],
): Map<string, SdkworkSearchProvider> {
  const registry = new Map<string, SdkworkSearchProvider>();

  for (const provider of providers) {
    const manifest = normalizeSdkworkSearchProviderManifest(provider.manifest);
    if (registry.has(manifest.providerId)) {
      throw new Error(`Duplicate search provider id: ${manifest.providerId}`);
    }

    registry.set(manifest.providerId, {
      ...provider,
      manifest,
    });
  }

  return registry;
}

function selectProvider(
  registry: Map<string, SdkworkSearchProvider>,
  request: {
    providerId?: string;
    providerKind?: SdkworkSearchProviderKind;
  },
  requiredCapabilities: readonly SdkworkSearchProviderCapability[],
): SdkworkSearchProvider | undefined {
  if (registry.size === 0) {
    return undefined;
  }

  const selectedManifest = selectSdkworkSearchProvider(
    Array.from(registry.values()).map((provider) => provider.manifest),
    {
      preferredKind: normalizeProviderKind(request.providerKind),
      providerId: request.providerId,
      requiredCapabilities,
    },
  );

  return registry.get(selectedManifest.providerId);
}

function createMissingProviderCapabilityError(
  provider: SdkworkSearchProvider,
  capability: SdkworkSearchProviderCapability,
): Error {
  return new Error(
    `Search provider ${provider.manifest.providerId} does not implement ${capability}`,
  );
}

function assertExternalProviderImplementsCapabilities(
  providerId: string,
  capabilities: readonly SdkworkSearchProviderCapability[],
  handlers: Pick<
    CreateExternalSearchProviderOptions,
    | "promote"
    | "query"
    | "recommend"
    | "recordEvent"
    | "semanticQuery"
    | "suggest"
    | "syncIndex"
    | "upsertDocument"
  >,
): void {
  const executableCapabilities: Partial<
    Record<
      SdkworkSearchProviderCapability,
      keyof Pick<
        CreateExternalSearchProviderOptions,
        | "promote"
        | "query"
        | "recommend"
        | "recordEvent"
        | "semanticQuery"
        | "suggest"
        | "syncIndex"
        | "upsertDocument"
      >
    >
  > = {
    document_indexing: "upsertDocument",
    event_ingestion: "recordEvent",
    hybrid_search: "semanticQuery",
    lexical_search: "query",
    promotions: "promote",
    recommendations: "recommend",
    semantic_search: "semanticQuery",
    suggestions: "suggest",
  };

  for (const capability of capabilities) {
    const handlerName = executableCapabilities[capability];
    if (handlerName && !handlers[handlerName]) {
      throw new Error(
        `External search provider ${providerId} declares ${capability} but does not implement ${handlerName}`,
      );
    }
  }
}

export function createMemorySearchProvider({
  documents = [],
  providerId = "memory",
  providerKind = "memory",
  recommendationStrategies = [],
  requestIdFactory = createDefaultRequestId,
}: CreateMemorySearchProviderOptions = {}): SdkworkSearchProvider {
  const indexedDocuments = new Map<string, SdkworkSearchDocument>();
  for (const document of documents) {
    indexedDocuments.set(document.id, document);
  }
  const currentDocuments = () => Array.from(indexedDocuments.values());
  const catalog = () => createSdkworkSearchCatalog(currentDocuments());
  const normalizedProviderId = defaultIfBlank(providerId, "memory");

  return {
    manifest: normalizeSdkworkSearchProviderManifest({
      capabilities: [
        "document_indexing",
        "event_ingestion",
        "hybrid_search",
        "lexical_search",
        "promotions",
        "provider_health",
        "recommendations",
        "semantic_search",
        "suggestions",
      ],
      defaultFor: [
        "event_ingestion",
        "hybrid_search",
        "lexical_search",
        "promotions",
        "provider_health",
        "recommendations",
        "semantic_search",
        "suggestions",
      ],
      displayName: normalizedProviderId === "memory" ? "Memory Search" : normalizedProviderId,
      kind: providerKind,
      priority: 10,
      providerId: normalizedProviderId,
      status: "active",
    }),
    checkHealth: async () => ({
      checkedAt: new Date(0).toISOString(),
      details: {
        documentCount: indexedDocuments.size,
      },
      latencyMs: 0,
      providerId: normalizedProviderId,
      status: "healthy",
    }),
    promote: async (request) =>
      createSdkworkPromotionResponse(catalog(), {
        ...request,
        requestId: request.requestId ?? requestIdFactory(),
      }),
    query: async (request) =>
      createSdkworkSearchQueryResponse(catalog(), {
        ...request,
        q: request.q ?? "",
        requestId: request.requestId ?? requestIdFactory(),
      }),
    recommend: async (request) =>
      createSdkworkRecommendationResponse(catalog(), {
        ...request,
        requestId: request.requestId ?? requestIdFactory(),
      }, {
        strategies: recommendationStrategies,
      }),
    recordEvent: async (event) => {
      const normalizedEvent = normalizeSdkworkSearchUserEvent(event);

      return {
        accepted: true,
        requestId: normalizedEvent.requestId ?? requestIdFactory(),
      };
    },
    semanticQuery: async (request) => {
      const response = createSdkworkSemanticSearchQueryResponse(catalog(), {
        ...request,
        embeddingProvider: request.embeddingProvider ?? normalizedProviderId,
        requestId: request.requestId ?? requestIdFactory(),
      });

      return {
        ...response,
        embeddingProvider: request.embeddingProvider ?? normalizedProviderId,
      };
    },
    suggest: async (request) =>
      createSdkworkSearchSuggestionsResponse(catalog(), {
        ...request,
        requestId: request.requestId ?? requestIdFactory(),
      }),
    upsertDocument: async (indexId, document) => {
      indexedDocuments.set(document.id, {
        ...document,
        metadata: {
          ...(document.metadata ?? {}),
          indexId,
        },
      });

      return {
        document,
        indexedAt: new Date(0).toISOString(),
        requestId: requestIdFactory(),
      };
    },
    syncIndex: async (index, sourceItems, options = {}) => {
      const requestId = options.requestId ?? requestIdFactory();
      const plan = createSdkworkSearchIndexSyncPlan(index, sourceItems, {
        ...options,
        requestId,
      });

      if (plan.syncMode === "full" || plan.syncMode === "snapshot") {
        for (const documentId of Array.from(indexedDocuments.keys())) {
          if (documentId.startsWith(`${plan.indexId}:`)) {
            indexedDocuments.delete(documentId);
          }
        }
      }

      for (const batch of plan.batches) {
        for (const document of batch.documents) {
          indexedDocuments.set(document.id, {
            ...document,
            metadata: {
              ...(document.metadata ?? {}),
              indexId: plan.indexId,
              providerId: plan.providerId,
              syncMode: plan.syncMode,
            },
          });
        }
      }

      return {
        indexedAt: new Date(0).toISOString(),
        indexedCount: plan.totalDocuments,
        indexId: plan.indexId,
        providerId: plan.providerId,
        requestId,
        syncMode: plan.syncMode,
        totalBatches: plan.totalBatches,
      };
    },
  };
}

export function createPostgresqlSearchProvider({
  documents = [],
  providerId = "postgresql",
  recommendationStrategies = [],
  repository,
  requestIdFactory = createDefaultRequestId,
}: CreatePostgresqlSearchProviderOptions = {}): SdkworkSearchProvider {
  const memoryBackedProvider = createMemorySearchProvider({
    documents,
    providerId,
    providerKind: "postgresql",
    recommendationStrategies,
    requestIdFactory,
  });
  const manifest = normalizeSdkworkSearchProviderManifest({
    ...SDKWORK_POSTGRESQL_SEARCH_PROVIDER_MANIFEST,
    providerId,
  });

  return {
    ...memoryBackedProvider,
    manifest,
    checkHealth: async () => {
      if (repository?.checkHealth) {
        const health = await repository.checkHealth();
        return {
          ...health,
          providerId,
        };
      }

      return {
        checkedAt: new Date(0).toISOString(),
        details: {
          defaultSearchModule: "postgresql",
          documentCount: documents.length,
          extensions: ["pg_trgm"],
          optionalExtensions: ["vector"],
        },
        latencyMs: 0,
        providerId,
        status: "healthy",
      };
    },
    promote: async (request) =>
      repository?.promote
        ? repository.promote(request)
        : memoryBackedProvider.promote?.(request) ??
          Promise.reject(createMissingProviderCapabilityError(memoryBackedProvider, "promotions")),
    query: async (request) =>
      repository?.query
        ? repository.query({
            ...request,
            q: request.q ?? "",
          })
        : memoryBackedProvider.query?.({
            ...request,
            q: request.q ?? "",
          }) ??
          Promise.reject(createMissingProviderCapabilityError(memoryBackedProvider, "lexical_search")),
    recommend: async (request) =>
      repository?.recommend
        ? repository.recommend(request)
        : memoryBackedProvider.recommend?.(request) ??
          Promise.reject(createMissingProviderCapabilityError(memoryBackedProvider, "recommendations")),
    recordEvent: async (event) =>
      repository?.recordEvent
        ? repository.recordEvent(event)
        : memoryBackedProvider.recordEvent?.(event) ??
          Promise.reject(createMissingProviderCapabilityError(memoryBackedProvider, "event_ingestion")),
    semanticQuery: async (request) => {
      const routedRequest = {
        ...request,
        embeddingProvider: request.embeddingProvider ?? providerId,
      };
      const response = repository?.semanticQuery
        ? await repository.semanticQuery(routedRequest)
        : await memoryBackedProvider.semanticQuery?.(routedRequest);
      if (!response) {
        throw createMissingProviderCapabilityError(memoryBackedProvider, "semantic_search");
      }

      return {
        ...response,
        embeddingProvider: request.embeddingProvider ?? providerId,
      };
    },
    suggest: async (request) =>
      repository?.suggest
        ? repository.suggest(request)
        : memoryBackedProvider.suggest?.(request) ??
          Promise.reject(createMissingProviderCapabilityError(memoryBackedProvider, "suggestions")),
    syncIndex: async (index, sourceItems, options) =>
      repository?.syncIndex
        ? repository.syncIndex(index, sourceItems, options)
        : memoryBackedProvider.syncIndex?.(index, sourceItems, options) ??
          Promise.reject(createMissingProviderCapabilityError(memoryBackedProvider, "document_indexing")),
    upsertDocument: async (indexId, document) =>
      repository?.upsertDocument
        ? repository.upsertDocument(indexId, document)
        : memoryBackedProvider.upsertDocument?.(indexId, document) ??
          Promise.reject(createMissingProviderCapabilityError(memoryBackedProvider, "document_indexing")),
  };
}

export function createExternalSearchProvider({
  capabilities,
  checkHealth,
  displayName,
  kind,
  metadata,
  priority = 50,
  providerId,
  promote,
  query,
  recommend,
  recordEvent,
  semanticQuery,
  status = "active",
  suggest,
  syncIndex,
  upsertDocument,
}: CreateExternalSearchProviderOptions): SdkworkSearchProvider {
  const normalizedProviderId = providerId.trim();
  assertExternalProviderImplementsCapabilities(normalizedProviderId, capabilities, {
    promote,
    query,
    recommend,
    recordEvent,
    semanticQuery,
    suggest,
    syncIndex,
    upsertDocument,
  });
  const manifest = normalizeSdkworkSearchProviderManifest({
    capabilities,
    defaultFor: [],
    displayName,
    kind,
    metadata,
    priority,
    providerId: normalizedProviderId,
    status,
  });

  return {
    manifest,
    checkHealth: checkHealth ?? (async () => ({
      checkedAt: new Date(0).toISOString(),
      details: {
        kind: manifest.kind,
      },
      latencyMs: 0,
      providerId: manifest.providerId,
      status: manifest.status === "active" ? "healthy" : "unknown",
    })),
    promote,
    query,
    recommend,
    recordEvent,
    semanticQuery,
    suggest,
    syncIndex,
    upsertDocument,
  };
}

function createSpecificExternalSearchProvider(
  kind: Exclude<SdkworkSearchProviderKind, "memory" | "postgresql" | "custom">,
  options: CreateSpecificExternalSearchProviderOptions,
): SdkworkSearchProvider {
  return createExternalSearchProvider({
    ...options,
    kind,
  });
}

export function createOpenSearchProvider(
  options: CreateSpecificExternalSearchProviderOptions,
): SdkworkSearchProvider {
  return createSpecificExternalSearchProvider("opensearch", options);
}

export function createElasticsearchProvider(
  options: CreateSpecificExternalSearchProviderOptions,
): SdkworkSearchProvider {
  return createSpecificExternalSearchProvider("elasticsearch", options);
}

export function createMeilisearchProvider(
  options: CreateSpecificExternalSearchProviderOptions,
): SdkworkSearchProvider {
  return createSpecificExternalSearchProvider("meilisearch", options);
}

export function createTypesenseProvider(
  options: CreateSpecificExternalSearchProviderOptions,
): SdkworkSearchProvider {
  return createSpecificExternalSearchProvider("typesense", options);
}

export function createAlgoliaProvider(
  options: CreateSpecificExternalSearchProviderOptions,
): SdkworkSearchProvider {
  return createSpecificExternalSearchProvider("algolia", options);
}

export function createVectorSearchProvider(
  options: CreateSpecificExternalSearchProviderOptions,
): SdkworkSearchProvider {
  return createSpecificExternalSearchProvider("vector", options);
}

export function createSdkworkSearchSolutionSet({
  defaultProvider = "postgresql",
  documents = [],
  externalProviders = [],
  recommendationStrategies = [],
  requestIdFactory = createDefaultRequestId,
}: CreateSdkworkSearchSolutionSetOptions = {}): Pick<
  CreateSdkworkSearchServiceOptions,
  "localDocuments" | "providers" | "requestIdFactory"
> {
  const providers: SdkworkSearchProvider[] = [];

  if (defaultProvider === "postgresql") {
    providers.push(createPostgresqlSearchProvider({
      documents,
      recommendationStrategies,
      requestIdFactory,
    }));
  }

  providers.push(...externalProviders);

  if (defaultProvider === "memory") {
    providers.push(createMemorySearchProvider({
      documents,
      recommendationStrategies,
      requestIdFactory,
    }));
  }

  return {
    localDocuments: documents,
    providers,
    requestIdFactory,
  };
}

export function createSdkworkSearchService({
  appClient,
  backendClient,
  localDocuments = [],
  providers = [],
  recommendationStrategies = [],
  requestIdFactory = createDefaultRequestId,
}: CreateSdkworkSearchServiceOptions = {}): SdkworkSearchService {
  const shouldAttachDefaultPostgresqlProvider =
    !appClient &&
    !providers.some((provider) => provider.manifest.kind === "postgresql");
  const configuredProviders = shouldAttachDefaultPostgresqlProvider
    ? [
        createPostgresqlSearchProvider({
          documents: localDocuments,
          recommendationStrategies,
          requestIdFactory,
        }),
        ...providers,
      ]
    : providers;
  const providerRegistry = createProviderRegistry(configuredProviders);
  const localProvider = createMemorySearchProvider({
    documents: localDocuments,
    recommendationStrategies,
    requestIdFactory,
  });

  return {
    async checkProviderHealth(providerId) {
      const provider = providerRegistry.get(providerId) ??
        (providerId === localProvider.manifest.providerId ? localProvider : undefined);
      if (!provider) {
        throw new Error(`Unknown search provider: ${providerId}`);
      }

      if (provider.checkHealth) {
        return provider.checkHealth();
      }

      return {
        checkedAt: new Date(0).toISOString(),
        providerId: provider.manifest.providerId,
        status: provider.manifest.status === "active" ? "healthy" : "unknown",
      };
    },

    listProviders() {
      const manifests = Array.from(providerRegistry.values()).map((provider) => provider.manifest);
      if (!providerRegistry.has(localProvider.manifest.providerId)) {
        manifests.push(localProvider.manifest);
      }

      return manifests;
    },

    async promote(request) {
      const provider = selectProvider(providerRegistry, request, ["promotions"]);
      if (provider) {
        if (!provider.promote) {
          throw createMissingProviderCapabilityError(provider, "promotions");
        }

        return provider.promote(request);
      }

      if (appClient?.search.promotions) {
        return appClient.search.promotions.create(request);
      }

      return localProvider.promote?.(request) ??
        Promise.reject(createMissingProviderCapabilityError(localProvider, "promotions"));
    },

    async query(request) {
      const q = request.q ?? "";
      const provider = selectProvider(providerRegistry, request, ["lexical_search"]);
      if (provider) {
        if (!provider.query) {
          throw createMissingProviderCapabilityError(provider, "lexical_search");
        }

        return provider.query({
          ...request,
          q,
        });
      }

      if (appClient) {
        return appClient.search.queries.create({
          ...request,
          q,
        });
      }

      return localProvider.query?.({
        ...request,
        q,
      }) ?? Promise.reject(createMissingProviderCapabilityError(localProvider, "lexical_search"));
    },

    async recommend(request) {
      const provider = selectProvider(providerRegistry, request, ["recommendations"]);
      if (provider) {
        if (!provider.recommend) {
          throw createMissingProviderCapabilityError(provider, "recommendations");
        }

        return provider.recommend(request);
      }

      if (appClient?.search.recommendations) {
        return appClient.search.recommendations.create(request);
      }

      return localProvider.recommend?.(request) ??
        Promise.reject(createMissingProviderCapabilityError(localProvider, "recommendations"));
    },

    async recordEvent(event) {
      const normalizedEvent = normalizeSdkworkSearchUserEvent(event);
      const provider = selectProvider(providerRegistry, normalizedEvent, ["event_ingestion"]);
      if (provider) {
        if (!provider.recordEvent) {
          throw createMissingProviderCapabilityError(provider, "event_ingestion");
        }

        return provider.recordEvent(normalizedEvent);
      }

      if (appClient?.search.events) {
        return appClient.search.events.create(normalizedEvent);
      }

      return localProvider.recordEvent?.(normalizedEvent) ??
        Promise.reject(createMissingProviderCapabilityError(localProvider, "event_ingestion"));
    },

    async semanticQuery(request) {
      const provider = selectProvider(providerRegistry, request, ["semantic_search"]);
      if (provider) {
        if (!provider.semanticQuery) {
          throw createMissingProviderCapabilityError(provider, "semantic_search");
        }

        return provider.semanticQuery(request);
      }

      return localProvider.semanticQuery?.(request) ??
        Promise.reject(createMissingProviderCapabilityError(localProvider, "semantic_search"));
    },

    async suggest(request) {
      const provider = selectProvider(providerRegistry, request, ["suggestions"]);
      if (provider) {
        if (!provider.suggest) {
          throw createMissingProviderCapabilityError(provider, "suggestions");
        }

        return provider.suggest(request);
      }

      if (appClient?.search.suggestions) {
        return appClient.search.suggestions.list(request);
      }

      return localProvider.suggest?.(request) ??
        Promise.reject(createMissingProviderCapabilityError(localProvider, "suggestions"));
    },

    async syncIndex(index, sourceItems, options = {}) {
      const requestId = options.requestId ?? requestIdFactory();
      const plan = createSdkworkSearchIndexSyncPlan(index, sourceItems, {
        ...options,
        requestId,
      });
      const provider = selectProvider(
        providerRegistry,
        {
          providerId: plan.index.providerId,
        },
        ["document_indexing"],
      );

      if (provider) {
        if (provider.syncIndex) {
          return provider.syncIndex(plan.index, sourceItems, {
            ...options,
            requestId,
          });
        }

        if (!provider.upsertDocument) {
          throw createMissingProviderCapabilityError(provider, "document_indexing");
        }

        let indexedCount = 0;
        for (const batch of plan.batches) {
          for (const document of batch.documents) {
            await provider.upsertDocument(plan.indexId, document);
            indexedCount += 1;
          }
        }

        return {
          indexedAt: new Date(0).toISOString(),
          indexedCount,
          indexId: plan.indexId,
          providerId: provider.manifest.providerId,
          requestId,
          syncMode: plan.syncMode,
          totalBatches: plan.totalBatches,
        };
      }

      if (backendClient?.search.documents.bulkUpsert) {
        let indexedCount = 0;
        for (const batch of plan.batches) {
          const response = await backendClient.search.documents.bulkUpsert(
            plan.indexId,
            {
              documents: batch.documents,
            },
            {
              idempotencyKey: requestId,
            },
          );
          indexedCount += response.upsertedCount;
        }

        return {
          indexedAt: new Date(0).toISOString(),
          indexedCount,
          indexId: plan.indexId,
          providerId: plan.providerId,
          requestId,
          syncMode: plan.syncMode,
          totalBatches: plan.totalBatches,
        };
      }

      if (backendClient) {
        let indexedCount = 0;
        for (const batch of plan.batches) {
          for (const document of batch.documents) {
            await backendClient.search.documents.upsert(plan.indexId, document.id, {
              document,
            });
            indexedCount += 1;
          }
        }

        return {
          indexedAt: new Date(0).toISOString(),
          indexedCount,
          indexId: plan.indexId,
          providerId: plan.providerId,
          requestId,
          syncMode: plan.syncMode,
          totalBatches: plan.totalBatches,
        };
      }

      if (localProvider.syncIndex) {
        return localProvider.syncIndex(plan.index, sourceItems, {
          ...options,
          requestId,
        });
      }

      throw new Error("Missing search backend SDK client");
    },

    async upsertDocument(indexId, document) {
      if (backendClient && providers.length === 0) {
        return backendClient.search.documents.upsert(indexId, document.id, {
          document,
        });
      }

      const provider = selectProvider(providerRegistry, {}, ["document_indexing"]);
      if (provider) {
        if (!provider.upsertDocument) {
          throw createMissingProviderCapabilityError(provider, "document_indexing");
        }

        return provider.upsertDocument(indexId, document);
      }

      if (backendClient) {
        return backendClient.search.documents.upsert(indexId, document.id, {
          document,
        });
      }

      throw new Error("Missing search backend SDK client");
    },
  };
}

export const createSearchService = createSdkworkSearchService;
