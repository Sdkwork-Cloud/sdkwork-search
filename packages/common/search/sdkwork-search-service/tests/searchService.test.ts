import { describe, expect, it } from "vitest";
import {
  createAlgoliaProvider,
  createElasticsearchProvider,
  createExternalSearchProvider,
  createMemorySearchProvider,
  createMeilisearchProvider,
  createOpenSearchProvider,
  createPostgresqlSearchProvider,
  createSdkworkSearchService,
  createSdkworkSearchSolutionSet,
  createTypesenseProvider,
  createVectorSearchProvider,
  type SdkworkSearchAppSdkClient,
  type SdkworkSearchBackendSdkClient,
  type SdkworkSearchProvider,
} from "../src";
import type {
  SdkworkPromotionRequest,
  SdkworkRecommendationRequest,
  SdkworkSearchDocument,
  SdkworkSearchIndexDefinitionInput,
  SdkworkSearchQueryRequest,
  SdkworkSearchSuggestionsRequest,
  SdkworkSemanticSearchQueryRequest,
} from "@sdkwork/search-contracts";

const localDocuments: SdkworkSearchDocument[] = [
  {
    capability: "command",
    description: "Open chat",
    group: "Navigation",
    id: "chat",
    scope: "global",
    title: "Chat",
  },
  {
    capability: "knowledge",
    description: "Search knowledge sources",
    group: "AI",
    id: "knowledge",
    scope: "workspace",
    title: "Knowledge",
  },
];

describe("@sdkwork/search-service", () => {
  it("queries the injected app SDK client when one is provided", async () => {
    const appClient: SdkworkSearchAppSdkClient = {
      search: {
        queries: {
          create: async (body) => ({
            items: [],
            pageInfo: {
              page: 1,
              pageSize: 20,
              totalItems: 0,
              totalPages: 1,
            },
            q: body.q,
            requestId: "from-sdk",
          }),
        },
        recommendations: {
          create: async (body) => ({
            items: [],
            requestId: "recommendation-sdk",
            strategyId: body.strategyId ?? "default",
          }),
        },
        events: {
          create: async (_body) => ({
            accepted: true,
            requestId: "event-sdk",
          }),
        },
        suggestions: {
          list: async (params = {}) => ({
            items: [],
            q: params.q ?? "",
            requestId: "suggestion-sdk",
          }),
        },
      },
    };
    const service = createSdkworkSearchService({ appClient, localDocuments });

    await expect(service.query({ q: "chat" })).resolves.toMatchObject({
      q: "chat",
      requestId: "from-sdk",
    });
  });

  it("uses the local catalog fallback without raw HTTP", async () => {
    const service = createSdkworkSearchService({
      localDocuments,
      requestIdFactory: () => "postgresql-default",
    });
    const response = await service.query({ q: "knowledge" });

    expect(service.listProviders().map((provider) => provider.providerId)).toEqual([
      "postgresql",
      "memory",
    ]);
    expect(response.items.map((item) => item.document.id)).toEqual(["knowledge"]);
    expect(response.requestId).toBe("postgresql-default");
  });

  it("delegates backend document indexing through the injected backend SDK when no provider is configured", async () => {
    const indexed: SdkworkSearchDocument[] = [];
    const backendClient: SdkworkSearchBackendSdkClient = {
      search: {
        documents: {
          upsert: async (_indexId, _documentId, body) => {
            indexed.push(body.document);
            return {
              document: body.document,
              indexedAt: "2026-06-06T00:00:00.000Z",
              requestId: "backend-sdk",
            };
          },
        },
        promotions: {
          create: async (body) => ({
            promotion: {
              ...body,
              promotionId: "promo-1",
              status: "active",
            },
            requestId: "promotion-sdk",
          }),
        },
      },
    };
    const service = createSdkworkSearchService({ backendClient });

    await expect(
      service.upsertDocument("global", {
        id: "settings",
        title: "Settings",
      }),
    ).resolves.toMatchObject({
      requestId: "backend-sdk",
    });
    expect(indexed.map((document) => document.id)).toEqual(["settings"]);
  });

  it("uses the injected app SDK for recommendations when available", async () => {
    const appClient: SdkworkSearchAppSdkClient = {
      search: {
        queries: {
          create: async (body) => ({
            items: [],
            pageInfo: {
              page: 1,
              pageSize: 20,
              totalItems: 0,
              totalPages: 1,
            },
            q: body.q,
            requestId: "query-sdk",
          }),
        },
        recommendations: {
          create: async (body) => ({
            items: [],
            requestId: "recommendation-sdk",
            strategyId: body.strategyId ?? "default",
          }),
        },
        events: {
          create: async (_body) => ({
            accepted: true,
            requestId: "event-sdk",
          }),
        },
        suggestions: {
          list: async (params = {}) => ({
            items: [{ score: 100, source: "document", text: params.q ?? "" }],
            q: params.q ?? "",
            requestId: "suggestion-sdk",
          }),
        },
      },
    };
    const service = createSdkworkSearchService({ appClient, localDocuments });

    await expect(
      service.recommend({
        context: {
          capabilityIds: ["knowledge"],
        },
        strategyId: "default",
      }),
    ).resolves.toMatchObject({
      requestId: "recommendation-sdk",
      strategyId: "default",
    });
    await expect(service.suggest({ q: "kn" })).resolves.toMatchObject({
      q: "kn",
      requestId: "suggestion-sdk",
    });
    await expect(
      service.recordEvent({
        documentId: "knowledge",
        eventType: "click",
        occurredAt: "2026-06-06T00:00:00.000Z",
        surface: "app",
      }),
    ).resolves.toMatchObject({
      accepted: true,
      requestId: "event-sdk",
    });
  });

  it("uses local fallback for suggestions, recommendations, promotions, and events", async () => {
    const service = createSdkworkSearchService({
      localDocuments,
      requestIdFactory: () => "local-fixed",
    });

    await expect(service.suggest({ q: "kn" })).resolves.toMatchObject({
      requestId: "local-fixed",
    });
    await expect(
      service.recommend({
        context: {
          capabilityIds: ["knowledge"],
        },
      }),
    ).resolves.toMatchObject({
      requestId: "local-fixed",
    });
    await expect(
      service.promote({
        context: {
          capabilityIds: ["command"],
          placement: "global_search_top",
        },
      }),
    ).resolves.toMatchObject({
      requestId: "local-fixed",
    });
    await expect(
      service.recordEvent({
        documentId: "chat",
        eventType: "view",
        occurredAt: "2026-06-06T00:00:00.000Z",
        surface: "app",
      }),
    ).resolves.toMatchObject({
      accepted: true,
      requestId: "local-fixed",
    });
  });

  it("uses the default PostgreSQL provider for local document indexing without a backend SDK", async () => {
    const service = createSdkworkSearchService({
      localDocuments,
      requestIdFactory: () => "postgresql-upsert-local",
    });

    await expect(
      service.upsertDocument("global", {
        id: "settings",
        title: "Settings",
      }),
    ).resolves.toMatchObject({
      document: {
        id: "settings",
      },
      requestId: "postgresql-upsert-local",
    });
  });

  it("syncs source records into the default PostgreSQL index and exposes them through generic search", async () => {
    const service = createSdkworkSearchService({
      requestIdFactory: () => "postgresql-sync",
    });
    const index: SdkworkSearchIndexDefinitionInput = {
      capability: "knowledge",
      descriptionField: "summary",
      group: "Knowledge Base",
      indexId: "kb_articles",
      keywordFields: ["tags"],
      scope: "workspace",
      source: "kb",
      titleField: "title",
    };

    const response = await service.syncIndex(index, [
      {
        id: "pg",
        summary: "Use pg_trgm for lexical search",
        tags: ["postgresql", "trigram"],
        title: "PostgreSQL indexing",
      },
      {
        id: "semantic",
        summary: "Generate vectors for hybrid search",
        tags: ["vector"],
        title: "Semantic indexing",
      },
    ], {
      batchSize: 1,
      syncMode: "full",
    });

    expect(response).toMatchObject({
      indexedCount: 2,
      indexId: "kb_articles",
      providerId: "postgresql",
      requestId: "postgresql-sync",
      syncMode: "full",
      totalBatches: 2,
    });
    await expect(service.query({ q: "trigram" })).resolves.toMatchObject({
      requestId: "postgresql-sync",
    });
    const queryResponse = await service.query({ q: "trigram" });
    expect(queryResponse.items.map((item) => item.document.id)).toEqual(["kb_articles:pg"]);
  });

  it("routes search reads through selected provider capabilities", async () => {
    const routed: string[] = [];
    const provider: SdkworkSearchProvider = {
      manifest: {
        capabilities: [
          "event_ingestion",
          "lexical_search",
          "promotions",
          "recommendations",
          "semantic_search",
          "suggestions",
        ],
        defaultFor: [
          "event_ingestion",
          "lexical_search",
          "promotions",
          "recommendations",
          "semantic_search",
          "suggestions",
        ],
        displayName: "Test Provider",
        kind: "opensearch",
        priority: 50,
        providerId: "opensearch-primary",
        status: "active",
      },
      query: async (request: SdkworkSearchQueryRequest) => {
        routed.push(`query:${request.q}`);
        return {
          items: [],
          pageInfo: {
            page: 1,
            pageSize: 20,
            totalItems: 0,
            totalPages: 1,
          },
          q: request.q ?? "",
          requestId: "provider-query",
        };
      },
      recordEvent: async () => {
        routed.push("event");
        return {
          accepted: true,
          requestId: "provider-event",
        };
      },
      recommend: async (request: SdkworkRecommendationRequest) => {
        routed.push(`recommend:${request.strategyId ?? "default"}`);
        return {
          items: [],
          requestId: "provider-recommend",
          strategyId: request.strategyId ?? "default",
        };
      },
      promote: async (request: SdkworkPromotionRequest) => {
        routed.push(`promote:${request.context.placement}`);
        return {
          items: [],
          placement: request.context.placement,
          requestId: "provider-promote",
        };
      },
      semanticQuery: async (request: SdkworkSemanticSearchQueryRequest) => {
        routed.push(`semantic:${request.q}`);
        return {
          embeddingProvider: "opensearch-primary",
          items: [],
          mode: "hybrid",
          q: request.q,
          requestId: "provider-semantic",
          semanticProfileId: request.semanticProfileId ?? "default",
        };
      },
      suggest: async (request: SdkworkSearchSuggestionsRequest) => {
        routed.push(`suggest:${request.q ?? ""}`);
        return {
          items: [],
          q: request.q ?? "",
          requestId: "provider-suggest",
        };
      },
    };
    const service = createSdkworkSearchService({
      providers: [provider],
    });

    await expect(service.query({ providerId: "opensearch-primary", q: "chat" })).resolves.toMatchObject({
      requestId: "provider-query",
    });
    await expect(service.suggest({ providerId: "opensearch-primary", q: "ch" })).resolves.toMatchObject({
      requestId: "provider-suggest",
    });
    await expect(
      service.recommend({
        providerId: "opensearch-primary",
        strategyId: "semantic-related",
      }),
    ).resolves.toMatchObject({
      requestId: "provider-recommend",
    });
    await expect(
      service.promote({
        context: {
          placement: "global_search_top",
        },
        providerId: "opensearch-primary",
      }),
    ).resolves.toMatchObject({
      requestId: "provider-promote",
    });
    await expect(
      service.semanticQuery({
        providerId: "opensearch-primary",
        q: "hybrid search",
      }),
    ).resolves.toMatchObject({
      embeddingProvider: "opensearch-primary",
      mode: "hybrid",
      requestId: "provider-semantic",
    });
    await expect(
      service.recordEvent({
        eventType: "click",
        occurredAt: "2026-06-06T00:00:00.000Z",
        providerId: "opensearch-primary",
        surface: "app",
      }),
    ).resolves.toMatchObject({
      requestId: "provider-event",
    });
    expect(routed).toEqual([
      "query:chat",
      "suggest:ch",
      "recommend:semantic-related",
      "promote:global_search_top",
      "semantic:hybrid search",
      "event",
    ]);
  });

  it("exposes provider manifests, health checks, PostgreSQL default, and memory provider fallback", async () => {
    const memoryProvider = createMemorySearchProvider({
      documents: localDocuments,
      providerId: "memory-local",
      requestIdFactory: () => "memory-fixed",
    });
    const service = createSdkworkSearchService({
      providers: [memoryProvider],
    });

    expect(service.listProviders().map((provider) => provider.providerId)).toEqual([
      "postgresql",
      "memory-local",
      "memory",
    ]);
    await expect(service.checkProviderHealth("memory-local")).resolves.toMatchObject({
      providerId: "memory-local",
      status: "healthy",
    });
    await expect(service.query({ providerId: "memory-local", q: "knowledge" })).resolves.toMatchObject({
      requestId: "memory-fixed",
    });
    await expect(service.semanticQuery({ q: "knowledge" })).resolves.toMatchObject({
      embeddingProvider: "postgresql",
    });
  });

  it("exposes PostgreSQL as the implicit default and memory as local fallback", async () => {
    const service = createSdkworkSearchService({
      localDocuments,
      requestIdFactory: () => "local-fixed",
    });

    expect(service.listProviders()).toMatchObject([
      {
        kind: "postgresql",
        providerId: "postgresql",
        status: "active",
      },
      {
        kind: "memory",
        providerId: "memory",
        status: "active",
      },
    ]);
    await expect(service.checkProviderHealth("postgresql")).resolves.toMatchObject({
      providerId: "postgresql",
      status: "healthy",
    });
    await expect(service.checkProviderHealth("memory")).resolves.toMatchObject({
      providerId: "memory",
      status: "healthy",
    });
  });

  it("uses PostgreSQL as the default first-class search solution", async () => {
    const service = createSdkworkSearchService({
      localDocuments,
      providers: [
        createPostgresqlSearchProvider({
          documents: localDocuments,
          requestIdFactory: () => "postgresql-fixed",
        }),
      ],
    });

    expect(service.listProviders().map((provider) => provider.providerId)).toEqual([
      "postgresql",
      "memory",
    ]);
    await expect(service.query({ q: "knowledge" })).resolves.toMatchObject({
      requestId: "postgresql-fixed",
    });
    await expect(service.semanticQuery({ q: "knowledge" })).resolves.toMatchObject({
      embeddingProvider: "postgresql",
      mode: "semantic",
      requestId: "postgresql-fixed",
    });
    await expect(service.checkProviderHealth("postgresql")).resolves.toMatchObject({
      providerId: "postgresql",
      status: "healthy",
    });
  });

  it("delegates PostgreSQL search capabilities to an injected repository adapter", async () => {
    const calls: string[] = [];
    const provider = createPostgresqlSearchProvider({
      providerId: "postgresql-primary",
      repository: {
        checkHealth: async () => {
          calls.push("health");
          return {
            checkedAt: "2026-06-06T00:00:00.000Z",
            details: {
              adapter: "sqlx",
            },
            latencyMs: 7,
            providerId: "postgresql-primary",
            status: "healthy",
          };
        },
        upsertDocument: async (indexId, document) => {
          calls.push(`upsert:${indexId}:${document.id}`);
          return {
            document,
            indexedAt: "2026-06-06T00:00:00.000Z",
            requestId: "postgresql-upsert",
          };
        },
        promote: async (request) => {
          calls.push(`promote:${request.context.placement}`);
          return {
            items: [],
            placement: request.context.placement,
            requestId: request.requestId ?? "postgresql-promote",
          };
        },
        query: async (request) => {
          calls.push(`query:${request.q}`);
          return {
            items: [],
            pageInfo: {
              page: 1,
              pageSize: 20,
              totalItems: 0,
              totalPages: 1,
            },
            q: request.q ?? "",
            requestId: request.requestId ?? "postgresql-query",
          };
        },
        recommend: async (request) => {
          calls.push(`recommend:${request.strategyId ?? "default"}`);
          return {
            items: [],
            requestId: request.requestId ?? "postgresql-recommend",
            strategyId: request.strategyId ?? "default",
          };
        },
        recordEvent: async (event) => {
          calls.push(`event:${event.eventType}`);
          return {
            accepted: true,
            requestId: event.requestId ?? "postgresql-event",
          };
        },
        semanticQuery: async (request) => {
          calls.push(`semantic:${request.q}`);
          return {
            embeddingProvider: request.embeddingProvider ?? "postgresql-primary",
            items: [],
            mode: "hybrid",
            q: request.q,
            requestId: request.requestId ?? "postgresql-semantic",
            semanticProfileId: request.semanticProfileId ?? "default",
          };
        },
        suggest: async (request) => {
          calls.push(`suggest:${request.q ?? ""}`);
          return {
            items: [],
            q: request.q ?? "",
            requestId: request.requestId ?? "postgresql-suggest",
          };
        },
      },
    });
    const service = createSdkworkSearchService({
      providers: [provider],
    });

    await expect(service.checkProviderHealth("postgresql-primary")).resolves.toMatchObject({
      details: {
        adapter: "sqlx",
      },
      latencyMs: 7,
      providerId: "postgresql-primary",
      status: "healthy",
    });
    await expect(service.query({ q: "knowledge" })).resolves.toMatchObject({
      requestId: "postgresql-query",
    });
    await expect(
      service.upsertDocument("global", {
        id: "knowledge",
        title: "Knowledge",
      }),
    ).resolves.toMatchObject({
      requestId: "postgresql-upsert",
    });
    await expect(service.suggest({ q: "know" })).resolves.toMatchObject({
      requestId: "postgresql-suggest",
    });
    await expect(service.recommend({ strategyId: "related" })).resolves.toMatchObject({
      requestId: "postgresql-recommend",
    });
    await expect(
      service.promote({
        context: {
          placement: "global_search_top",
        },
      }),
    ).resolves.toMatchObject({
      requestId: "postgresql-promote",
    });
    await expect(service.semanticQuery({ q: "hybrid" })).resolves.toMatchObject({
      embeddingProvider: "postgresql-primary",
      mode: "hybrid",
      requestId: "postgresql-semantic",
    });
    await expect(
      service.recordEvent({
        eventType: "click",
        occurredAt: "2026-06-06T00:00:00.000Z",
        surface: "app",
      }),
    ).resolves.toMatchObject({
      requestId: "postgresql-event",
    });
    expect(calls).toEqual([
      "health",
      "query:knowledge",
      "upsert:global:knowledge",
      "suggest:know",
      "recommend:related",
      "promote:global_search_top",
      "semantic:hybrid",
      "event:click",
    ]);
  });

  it("wraps external search engines behind the same provider contract", async () => {
    const calls: string[] = [];
    const provider = createExternalSearchProvider({
      capabilities: ["lexical_search", "suggestions", "provider_health"],
      displayName: "Elastic Cluster",
      kind: "elasticsearch",
      providerId: "elastic-primary",
      query: async (request) => {
        calls.push(`query:${request.q}`);
        return {
          items: [],
          pageInfo: {
            page: 1,
            pageSize: 20,
            totalItems: 0,
            totalPages: 1,
          },
          q: request.q ?? "",
          requestId: "elastic-query",
        };
      },
      suggest: async (request) => {
        calls.push(`suggest:${request.q}`);
        return {
          items: [{ score: 100, source: "query", text: `${request.q}-external` }],
          q: request.q ?? "",
          requestId: "elastic-suggest",
        };
      },
    });
    const service = createSdkworkSearchService({ providers: [provider] });

    await expect(service.query({ providerKind: "elasticsearch", q: "chat" })).resolves.toMatchObject({
      requestId: "elastic-query",
    });
    await expect(service.suggest({ providerId: "elastic-primary", q: "cha" })).resolves.toMatchObject({
      requestId: "elastic-suggest",
    });
    await expect(service.checkProviderHealth("elastic-primary")).resolves.toMatchObject({
      providerId: "elastic-primary",
      status: "healthy",
    });
    expect(calls).toEqual(["query:chat", "suggest:cha"]);
  });

  it("routes index synchronization through selected external document indexing providers", async () => {
    const indexed: string[] = [];
    const provider = createExternalSearchProvider({
      capabilities: ["document_indexing", "provider_health"],
      displayName: "Typesense Indexer",
      kind: "typesense",
      providerId: "typesense-indexer",
      upsertDocument: async (indexId, document) => {
        indexed.push(`${indexId}:${document.id}`);
        return {
          document,
          indexedAt: "2026-06-06T00:00:00.000Z",
          requestId: "typesense-upsert",
        };
      },
    });
    const service = createSdkworkSearchService({
      providers: [provider],
      requestIdFactory: () => "sync-external",
    });

    await expect(
      service.syncIndex(
        {
          indexId: "products",
          providerId: "typesense-indexer",
          titleField: "name",
        },
        [
          {
            id: "sku-1",
            name: "Search Appliance",
          },
        ],
      ),
    ).resolves.toMatchObject({
      indexedCount: 1,
      providerId: "typesense-indexer",
      requestId: "sync-external",
    });
    expect(indexed).toEqual(["products:products:sku-1"]);
  });

  it("keeps PostgreSQL as the default when external providers are registered without explicit defaults", async () => {
    const provider = createOpenSearchProvider({
      capabilities: ["lexical_search", "provider_health"],
      displayName: "OpenSearch Cluster",
      priority: 500,
      providerId: "opensearch-primary",
      query: async (request) => ({
        items: [],
        pageInfo: {
          page: 1,
          pageSize: 20,
          totalItems: 0,
          totalPages: 1,
        },
        q: request.q ?? "",
        requestId: "opensearch-query",
      }),
    });
    const service = createSdkworkSearchService({
      localDocuments,
      providers: [provider],
      requestIdFactory: () => "postgresql-default",
    });

    expect(service.listProviders().map((item) => `${item.providerId}:${item.kind}`)).toEqual([
      "postgresql:postgresql",
      "opensearch-primary:opensearch",
      "memory:memory",
    ]);
    await expect(service.query({ q: "knowledge" })).resolves.toMatchObject({
      requestId: "postgresql-default",
    });
    await expect(service.query({ providerKind: "opensearch", q: "knowledge" })).resolves.toMatchObject({
      requestId: "opensearch-query",
    });
  });

  it("keeps PostgreSQL as the default recommendation engine when external recommendation providers exist", async () => {
    const provider = createOpenSearchProvider({
      capabilities: ["recommendations", "provider_health"],
      displayName: "OpenSearch Recommendations",
      priority: 500,
      providerId: "opensearch-recommendations",
      recommend: async (request) => ({
        items: [],
        requestId: "opensearch-recommend",
        strategyId: request.strategyId ?? "external",
      }),
    });
    const service = createSdkworkSearchService({
      localDocuments,
      providers: [provider],
      requestIdFactory: () => "postgresql-recommend-default",
    });

    await expect(service.recommend({ limit: 2 })).resolves.toMatchObject({
      requestId: "postgresql-recommend-default",
      strategyId: "postgresql-hybrid",
    });
    await expect(
      service.recommend({
        providerId: "opensearch-recommendations",
        strategyId: "opensearch-popular",
      }),
    ).resolves.toMatchObject({
      requestId: "opensearch-recommend",
      strategyId: "opensearch-popular",
    });
  });

  it("configures PostgreSQL recommendation strategies through service options", async () => {
    const service = createSdkworkSearchService({
      localDocuments,
      recommendationStrategies: [
        {
          engine: "postgresql",
          providerId: "postgresql",
          status: "active",
          strategyId: "tenant-content",
          strategyType: "content",
          title: "Tenant Content",
        },
      ],
      requestIdFactory: () => "postgresql-custom-recommend",
    });

    const response = await service.recommend({
      context: {
        q: "knowledge",
      },
      strategyId: "tenant-content",
    });

    expect(response).toMatchObject({
      requestId: "postgresql-custom-recommend",
      strategyId: "tenant-content",
    });
    expect(response.items[0]?.document.id).toBe("knowledge");
    expect(response.items[0]?.reasonCodes).toEqual(
      expect.arrayContaining(["strategy_content", "content_signal", "query_match"]),
    );
  });

  it("exposes focused provider factories for supported external search solutions", () => {
    const query = async (request: SdkworkSearchQueryRequest) => ({
      items: [],
      pageInfo: {
        page: 1,
        pageSize: 20,
        totalItems: 0,
        totalPages: 1,
      },
      q: request.q ?? "",
      requestId: "provider-query",
    });
    const semanticQuery = async (request: SdkworkSemanticSearchQueryRequest) => ({
      embeddingProvider: "vector-primary",
      items: [],
      mode: "hybrid" as const,
      q: request.q,
      requestId: "vector-query",
      semanticProfileId: request.semanticProfileId ?? "default",
    });

    const providers = [
      createOpenSearchProvider({
        capabilities: ["lexical_search"],
        displayName: "OpenSearch",
        providerId: "opensearch-primary",
        query,
      }),
      createElasticsearchProvider({
        capabilities: ["lexical_search"],
        displayName: "Elasticsearch",
        providerId: "elasticsearch-primary",
        query,
      }),
      createMeilisearchProvider({
        capabilities: ["lexical_search"],
        displayName: "Meilisearch",
        providerId: "meilisearch-primary",
        query,
      }),
      createTypesenseProvider({
        capabilities: ["lexical_search"],
        displayName: "Typesense",
        providerId: "typesense-primary",
        query,
      }),
      createAlgoliaProvider({
        capabilities: ["lexical_search"],
        displayName: "Algolia",
        providerId: "algolia-primary",
        query,
      }),
      createVectorSearchProvider({
        capabilities: ["semantic_search"],
        displayName: "Vector Search",
        providerId: "vector-primary",
        semanticQuery,
      }),
    ];

    expect(providers.map((provider) => provider.manifest.kind)).toEqual([
      "opensearch",
      "elasticsearch",
      "meilisearch",
      "typesense",
      "algolia",
      "vector",
    ]);
  });

  it("rejects external providers that declare executable capabilities without adapters", () => {
    expect(() =>
      createExternalSearchProvider({
        capabilities: ["lexical_search", "provider_health"],
        displayName: "Broken OpenSearch",
        kind: "opensearch",
        providerId: "broken-opensearch",
      }),
    ).toThrowError(
      "External search provider broken-opensearch declares lexical_search but does not implement query",
    );
  });

  it("builds a solution set with PostgreSQL default, external adapters, and memory fallback", async () => {
    const solutions = createSdkworkSearchSolutionSet({
      defaultProvider: "postgresql",
      documents: localDocuments,
      externalProviders: [
        createExternalSearchProvider({
          capabilities: ["lexical_search", "provider_health"],
          displayName: "OpenSearch Cluster",
          kind: "opensearch",
          providerId: "opensearch-secondary",
          query: async (request) => ({
            items: [],
            pageInfo: {
              page: 1,
              pageSize: 20,
              totalItems: 0,
              totalPages: 1,
            },
            q: request.q ?? "",
            requestId: "opensearch-query",
          }),
        }),
      ],
      requestIdFactory: () => "solution-fixed",
    });
    const service = createSdkworkSearchService(solutions);

    expect(service.listProviders().map((provider) => provider.providerId)).toEqual([
      "postgresql",
      "opensearch-secondary",
      "memory",
    ]);
    await expect(service.query({ q: "knowledge" })).resolves.toMatchObject({
      requestId: "solution-fixed",
    });
    await expect(service.query({ providerId: "opensearch-secondary", q: "knowledge" })).resolves.toMatchObject({
      requestId: "opensearch-query",
    });
  });
});
