import { describe, expect, it } from "vitest";
import {
  createSdkworkSearchIndexSyncPlan,
  createSdkworkPromotionResponse,
  createSdkworkRecommendationResponse,
  createSdkworkSearchCatalog,
  createSdkworkRecommendationStrategyRegistry,
  createSdkworkSearchAnalyticsOverview,
  createSdkworkSearchQueryResponse,
  createSdkworkSemanticSearchQueryResponse,
  createSdkworkSearchSuggestionsResponse,
  mapSdkworkSearchIndexSourceItems,
  normalizeSdkworkSearchIndexDefinition,
  normalizeSdkworkSearchProviderManifest,
  normalizeSdkworkSearchQuery,
  normalizeSdkworkSearchUserEvent,
  searchSdkworkSearchCatalog,
  selectSdkworkRecommendationStrategy,
  selectSdkworkSearchProvider,
  SDKWORK_POSTGRESQL_RECOMMENDATION_STRATEGY,
  SDKWORK_POSTGRESQL_SEARCH_PROVIDER_MANIFEST,
  type SdkworkSearchDocument,
} from "../src";

const documents: SdkworkSearchDocument[] = [
  {
    capability: "command",
    description: "Open the main chat workbench",
    group: "Navigation",
    groupOrder: 1,
    id: "chat",
    keywords: ["conversation", "assistant"],
    order: 1,
    scope: "global",
    source: "shell",
    title: "Chat",
  },
  {
    capability: "intelligence",
    description: "Manage model routing and provider catalogs",
    group: "AI",
    groupOrder: 2,
    id: "models",
    keywords: ["llm", "providers"],
    order: 1,
    scope: "workspace",
    source: "model-center",
    title: "Models",
  },
];

describe("@sdkwork/search-contracts", () => {
  it("normalizes documents into a deterministic catalog", () => {
    const catalog = createSdkworkSearchCatalog(documents);

    expect(catalog.documents.map((document) => document.id)).toEqual(["chat", "models"]);
    expect(catalog.capabilityIds).toEqual(["command", "intelligence"]);
    expect(catalog.groups.map((group) => group.id)).toEqual(["navigation", "ai"]);
  });

  it("normalizes generic search query text and ranks title matches", () => {
    const catalog = createSdkworkSearchCatalog(documents);
    const results = searchSdkworkSearchCatalog(catalog, "  CHAT ");

    expect(normalizeSdkworkSearchQuery("  CHAT ")).toBe("chat");
    expect(results.map((result) => result.document.id)).toEqual(["chat"]);
    expect(results[0]?.matchedOn).toBe("title");
  });

  it("creates API-ready query responses with stable metadata", () => {
    const catalog = createSdkworkSearchCatalog(documents);
    const response = createSdkworkSearchQueryResponse(catalog, {
      q: "model",
      page: 1,
      pageSize: 20,
      requestId: "search-request-1",
    });

    expect(response).toMatchObject({
      pageInfo: {
        page: 1,
        pageSize: 20,
        totalItems: 1,
      },
      q: "model",
      requestId: "search-request-1",
    });
    expect(response.items.map((item) => item.document.id)).toEqual(["models"]);
  });

  it("normalizes index definitions and maps source records into search documents", () => {
    const index = normalizeSdkworkSearchIndexDefinition({
      capability: "knowledge",
      descriptionField: "summary",
      enabled: true,
      group: "Knowledge Base",
      indexId: "  kb_articles  ",
      keywordFields: ["tags", "category"],
      metadataFields: ["owner"],
      scope: "workspace",
      source: "kb",
      titleField: "name",
    });

    const documents = mapSdkworkSearchIndexSourceItems(index, [
      {
        category: "Guide",
        id: "a-1",
        name: "PostgreSQL Search",
        owner: "platform",
        summary: "Build trigram-backed search indexes",
        tags: ["postgresql", "search"],
      },
    ]);

    expect(index).toMatchObject({
      capability: "knowledge",
      descriptionField: "summary",
      enabled: true,
      indexId: "kb_articles",
      providerId: "postgresql",
      titleField: "name",
    });
    expect(documents).toEqual([
      expect.objectContaining({
        capability: "knowledge",
        description: "Build trigram-backed search indexes",
        id: "kb_articles:a-1",
        keywords: ["postgresql", "search", "Guide"],
        metadata: {
          owner: "platform",
        },
        scope: "workspace",
        source: "kb",
        title: "PostgreSQL Search",
      }),
    ]);
  });

  it("creates deterministic search index sync plans for batched PostgreSQL indexing", () => {
    const index = normalizeSdkworkSearchIndexDefinition({
      indexId: "kb_articles",
      titleField: "title",
    });
    const plan = createSdkworkSearchIndexSyncPlan(index, [
      { id: "1", title: "One" },
      { id: "2", title: "Two" },
      { id: "3", title: "Three" },
    ], {
      batchSize: 2,
      requestId: "sync-request-1",
      syncMode: "full",
    });

    expect(plan).toMatchObject({
      indexId: "kb_articles",
      providerId: "postgresql",
      requestId: "sync-request-1",
      syncMode: "full",
      totalDocuments: 3,
      totalBatches: 2,
    });
    expect(plan.batches.map((batch) => batch.documents.map((document) => document.id))).toEqual([
      ["kb_articles:1", "kb_articles:2"],
      ["kb_articles:3"],
    ]);
  });

  it("creates suggestion responses from query text, titles, and keywords", () => {
    const catalog = createSdkworkSearchCatalog(documents);
    const response = createSdkworkSearchSuggestionsResponse(catalog, {
      q: "mo",
      limit: 5,
      requestId: "search-request-2",
    });

    expect(response.q).toBe("mo");
    expect(response.requestId).toBe("search-request-2");
    expect(response.items.map((item) => item.text)).toEqual(["models", "model routing"]);
    expect(response.items.every((item) => item.source === "document" || item.source === "query")).toBe(true);
  });

  it("creates explainable recommendation responses with deterministic scores", () => {
    const catalog = createSdkworkSearchCatalog(documents);
    const response = createSdkworkRecommendationResponse(catalog, {
      context: {
        capabilityIds: ["intelligence"],
        scopeIds: ["workspace"],
        recentDocumentIds: ["chat"],
      },
      limit: 3,
      requestId: "search-request-3",
      strategyId: "default",
    });

    expect(response.strategyId).toBe("postgresql-hybrid");
    expect(response.requestId).toBe("search-request-3");
    expect(response.items.map((item) => item.document.id)).toEqual(["models", "chat"]);
    expect(response.items[0]?.reasonCodes).toContain("strategy_hybrid");
    expect(response.items[0]?.reasonCodes).toContain("capability_match");
  });

  it("declares PostgreSQL hybrid as the default recommendation strategy", () => {
    expect(SDKWORK_POSTGRESQL_RECOMMENDATION_STRATEGY).toMatchObject({
      engine: "postgresql",
      providerId: "postgresql",
      strategyId: "postgresql-hybrid",
      strategyType: "hybrid",
      status: "active",
    });

    const registry = createSdkworkRecommendationStrategyRegistry([
      {
        engine: "external",
        providerId: "opensearch-primary",
        strategyId: "opensearch-popular",
        strategyType: "popular",
        status: "active",
        title: "OpenSearch Popular",
      },
    ]);

    expect(selectSdkworkRecommendationStrategy(registry).strategyId).toBe("postgresql-hybrid");
    expect(
      selectSdkworkRecommendationStrategy(registry, {
        strategyId: "opensearch-popular",
      }).strategyType,
    ).toBe("popular");
    expect(
      selectSdkworkRecommendationStrategy(registry, {
        strategyType: "semantic",
      }).strategyId,
    ).toBe("postgresql-semantic");
  });

  it("applies recommendation strategies with explainable provider-agnostic signals", () => {
    const catalog = createSdkworkSearchCatalog([
      ...documents,
      {
        capability: "insight",
        description: "Surface team knowledge from semantic embeddings",
        group: "AI",
        groupOrder: 2,
        id: "insights",
        keywords: ["semantic", "embedding"],
        order: 2,
        scope: "workspace",
        source: "recommendation",
        title: "Insights",
      },
    ]);

    const semantic = createSdkworkRecommendationResponse(catalog, {
      context: {
        q: "semantic embeddings",
      },
      limit: 2,
      strategyId: "postgresql-semantic",
    });
    expect(semantic.strategyId).toBe("postgresql-semantic");
    expect(semantic.items[0]?.document.id).toBe("insights");
    expect(semantic.items[0]?.reasonCodes).toEqual(
      expect.arrayContaining(["strategy_semantic", "semantic_signal", "query_match"]),
    );

    const popular = createSdkworkRecommendationResponse(catalog, {
      context: {
        recentDocumentIds: ["chat"],
      },
      limit: 2,
      strategyId: "postgresql-popular",
    });
    expect(popular.items[0]?.document.id).toBe("chat");
    expect(popular.items[0]?.reasonCodes).toEqual(
      expect.arrayContaining(["strategy_popular", "popular_signal", "recent_activity"]),
    );
  });

  it("falls back to PostgreSQL hybrid recommendations for empty catalogs and unknown runtime strategy ids", () => {
    const empty = createSdkworkRecommendationResponse([], {
      limit: 5,
      strategyId: "missing-runtime-strategy",
    });

    expect(empty).toMatchObject({
      items: [],
      strategyId: "postgresql-hybrid",
    });

    const response = createSdkworkRecommendationResponse(documents, {
      strategyId: "missing-runtime-strategy",
    });

    expect(response.strategyId).toBe("postgresql-hybrid");
    expect(response.items[0]?.reasonCodes).toContain("strategy_hybrid");
  });

  it("creates promotion responses with placement and targeting reasons", () => {
    const catalog = createSdkworkSearchCatalog(documents);
    const response = createSdkworkPromotionResponse(catalog, {
      context: {
        capabilityIds: ["command"],
        placement: "global_search_top",
        scopeIds: ["global"],
      },
      limit: 2,
      requestId: "search-request-4",
    });

    expect(response.placement).toBe("global_search_top");
    expect(response.items.map((item) => item.document.id)).toEqual(["chat"]);
    expect(response.items[0]?.reasonCodes).toContain("placement_match");
  });

  it("normalizes user feedback events for search and recommendation learning", () => {
    const event = normalizeSdkworkSearchUserEvent({
      documentId: "chat",
      eventType: "click",
      metadata: {
        source: "keyboard",
      },
      occurredAt: "2026-06-06T00:00:00.000Z",
      q: " chat ",
      requestId: "search-request-5",
      surface: "app",
    });

    expect(event).toMatchObject({
      documentId: "chat",
      eventType: "click",
      q: "chat",
      requestId: "search-request-5",
      surface: "app",
    });
  });

  it("creates semantic query responses with explainable lexical fallback", () => {
    const catalog = createSdkworkSearchCatalog(documents);
    const response = createSdkworkSemanticSearchQueryResponse(catalog, {
      embeddingProvider: "postgresql",
      limit: 5,
      q: "provider routing",
      requestId: "search-request-6",
      semanticProfileId: "default-semantic",
    });

    expect(response.mode).toBe("semantic");
    expect(response.embeddingProvider).toBe("postgresql");
    expect(response.semanticProfileId).toBe("default-semantic");
    expect(response.requestId).toBe("search-request-6");
    expect(response.items.map((item) => item.document.id)).toContain("models");
    expect(response.items[0]?.reasonCodes).toContain("lexical_fallback");
  });

  it("creates analytics overview responses for backend dashboards", () => {
    const overview = createSdkworkSearchAnalyticsOverview({
      failedEmbeddingJobs: 1,
      indexedDocuments: 120,
      promotionClicks: 12,
      recommendationClicks: 21,
      requestId: "search-request-7",
      searchQueries: 99,
    });

    expect(overview).toMatchObject({
      failedEmbeddingJobs: 1,
      indexedDocuments: 120,
      promotionClicks: 12,
      recommendationClicks: 21,
      requestId: "search-request-7",
      searchQueries: 99,
    });
    expect(overview.clickThroughRate).toBe("0.3333");
  });

  it("normalizes provider manifests with explicit capabilities and stable defaults", () => {
    const provider = normalizeSdkworkSearchProviderManifest({
      capabilities: [
        "lexical_search",
        "suggestions",
        "lexical_search",
        "semantic_search",
      ],
      defaultFor: ["lexical_search", "suggestions", "lexical_search"],
      displayName: "  PostgreSQL Search  ",
      kind: "postgresql",
      priority: 10.8,
      providerId: "  postgresql  ",
      status: "active",
    });

    expect(provider).toMatchObject({
      capabilities: ["lexical_search", "suggestions", "semantic_search"],
      defaultFor: ["lexical_search", "suggestions"],
      displayName: "PostgreSQL Search",
      kind: "postgresql",
      priority: 10,
      providerId: "postgresql",
      status: "active",
    });
    expect(SDKWORK_POSTGRESQL_SEARCH_PROVIDER_MANIFEST.providerId).toBe("postgresql");
    expect(SDKWORK_POSTGRESQL_SEARCH_PROVIDER_MANIFEST.capabilities).toEqual(
      expect.arrayContaining([
        "document_indexing",
        "event_ingestion",
        "hybrid_search",
        "lexical_search",
        "provider_health",
        "recommendations",
        "semantic_search",
        "suggestions",
      ]),
    );
  });

  it("selects search providers by explicit id, provider kind, default capability, and fallback", () => {
    const providers = [
      normalizeSdkworkSearchProviderManifest({
        capabilities: ["lexical_search", "suggestions"],
        displayName: "Memory",
        kind: "memory",
        priority: 5,
        providerId: "memory",
        status: "active",
      }),
      normalizeSdkworkSearchProviderManifest({
        capabilities: ["lexical_search", "suggestions", "semantic_search"],
        defaultFor: ["lexical_search", "suggestions"],
        displayName: "OpenSearch",
        kind: "opensearch",
        priority: 20,
        providerId: "opensearch-primary",
        status: "active",
      }),
      normalizeSdkworkSearchProviderManifest({
        capabilities: ["lexical_search", "suggestions"],
        displayName: "Disabled Elasticsearch",
        kind: "elasticsearch",
        priority: 30,
        providerId: "elastic-disabled",
        status: "disabled",
      }),
    ];

    expect(
      selectSdkworkSearchProvider(providers, {
        providerId: "opensearch-primary",
        requiredCapabilities: ["semantic_search"],
      }).providerId,
    ).toBe("opensearch-primary");
    expect(
      selectSdkworkSearchProvider(providers, {
        preferredKind: "memory",
        requiredCapabilities: ["suggestions"],
      }).providerId,
    ).toBe("memory");
    expect(
      selectSdkworkSearchProvider(providers, {
        requiredCapabilities: ["lexical_search"],
      }).providerId,
    ).toBe("opensearch-primary");
    expect(
      selectSdkworkSearchProvider(providers, {
        fallbackProviderId: "memory",
        providerId: "elastic-disabled",
        requiredCapabilities: ["lexical_search"],
      }).providerId,
    ).toBe("memory");
    expect(() =>
      selectSdkworkSearchProvider(providers, {
        providerId: "missing",
        requiredCapabilities: ["lexical_search"],
      }),
    ).toThrowError("No active search provider matches selection");
  });

  it("keeps PostgreSQL as the default provider for core search capabilities", () => {
    const providers = [
      normalizeSdkworkSearchProviderManifest({
        capabilities: ["lexical_search"],
        displayName: "External Search",
        kind: "opensearch",
        priority: 200,
        providerId: "opensearch-high-priority",
        status: "active",
      }),
      SDKWORK_POSTGRESQL_SEARCH_PROVIDER_MANIFEST,
    ];

    expect(
      selectSdkworkSearchProvider(providers, {
        requiredCapabilities: ["lexical_search"],
      }).providerId,
    ).toBe("postgresql");
    expect(
      selectSdkworkSearchProvider(providers, {
        requiredCapabilities: ["semantic_search"],
      }).providerId,
    ).toBe("postgresql");
    expect(
      selectSdkworkSearchProvider(providers, {
        preferredKind: "opensearch",
        requiredCapabilities: ["lexical_search"],
      }).providerId,
    ).toBe("opensearch-high-priority");
  });
});
