import { mkdir, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const GENERATOR_PATH =
  "D:\\javasource\\spring-ai-plus\\sdk\\sdkwork-sdk-generator\\bin\\sdkgen.js";
const VERSION = "1.0.0";
const OWNER = "sdkwork-search";
const DOMAIN = "search";
const TAG = "search";

const LANGUAGE_MATRIX = {
  typescript: {
    appPackage: "@sdkwork/search-app-sdk",
    backendPackage: "@sdkwork/search-backend-sdk",
    manifest: "package.json",
  },
};

const SEARCH_PROVIDER_KINDS = [
  "algolia",
  "custom",
  "elasticsearch",
  "meilisearch",
  "memory",
  "opensearch",
  "postgresql",
  "typesense",
  "vector",
];

const SEARCH_PROVIDER_CAPABILITIES = [
  "analytics",
  "document_indexing",
  "event_ingestion",
  "hybrid_search",
  "lexical_search",
  "promotions",
  "provider_health",
  "ranking_profiles",
  "recommendations",
  "semantic_search",
  "suggestions",
  "synonyms",
];

const SEARCH_PROVIDER_STATUSES = ["active", "degraded", "disabled", "error", "unknown"];
const SEARCH_PROVIDER_HEALTH_STATUSES = ["degraded", "healthy", "unavailable", "unknown"];

async function ensureDir(filePath) {
  await mkdir(path.dirname(filePath), { recursive: true });
}

async function writeJson(filePath, value) {
  await ensureDir(filePath);
  await writeFile(filePath, `${JSON.stringify(value, null, 2)}\n`, "utf8");
}

function problemResponses() {
  const response = (description) => ({
    description,
    content: {
      "application/problem+json": {
        schema: { $ref: "#/components/schemas/ProblemDetail" },
      },
    },
  });

  return {
    400: response("Bad request"),
    401: response("Unauthorized"),
    403: response("Forbidden"),
    404: response("Not found"),
    409: response("Conflict"),
    500: response("Internal server error"),
  };
}

function jsonResponse(schemaRef) {
  return {
    description: "Success",
    content: {
      "application/json": {
        schema: { $ref: `#/components/schemas/${schemaRef}` },
      },
    },
  };
}

function security() {
  return [{ AuthToken: [], AccessToken: [] }];
}

function pageQueryParameters() {
  return [
    {
      name: "q",
      in: "query",
      required: false,
      schema: { type: "string" },
      description: "Standard free-text search query.",
    },
    {
      name: "page",
      in: "query",
      required: false,
      schema: { type: "integer", minimum: 1, default: 1 },
    },
    {
      name: "page_size",
      in: "query",
      required: false,
      schema: { type: "integer", minimum: 1, maximum: 200, default: 20 },
    },
  ];
}

function filterQueryParameters() {
  return [
    {
      name: "capability_ids",
      in: "query",
      required: false,
      schema: {
        type: "array",
        items: { type: "string" },
      },
      style: "form",
      explode: true,
    },
    {
      name: "group_ids",
      in: "query",
      required: false,
      schema: {
        type: "array",
        items: { type: "string" },
      },
      style: "form",
      explode: true,
    },
    {
      name: "scope_ids",
      in: "query",
      required: false,
      schema: {
        type: "array",
        items: { type: "string" },
      },
      style: "form",
      explode: true,
    },
  ];
}

function suggestionQueryParameters() {
  return [
    {
      name: "q",
      in: "query",
      required: false,
      schema: { type: "string" },
      description: "Standard free-text search query.",
    },
    {
      name: "limit",
      in: "query",
      required: false,
      schema: { type: "integer", minimum: 1, maximum: 50, default: 10 },
    },
    {
      name: "provider_id",
      in: "query",
      required: false,
      schema: { type: "string" },
      description: "Optional search provider id for provider-routed suggestions.",
    },
    {
      name: "provider_kind",
      in: "query",
      required: false,
      schema: { type: "string", enum: SEARCH_PROVIDER_KINDS },
      description: "Optional search provider kind for provider-routed suggestions.",
    },
    ...filterQueryParameters(),
  ];
}

function pathParameter(name) {
  return {
    name,
    in: "path",
    required: true,
    schema: { type: "string" },
  };
}

function idempotencyKeyParameter() {
  return {
    name: "Idempotency-Key",
    in: "header",
    required: false,
    schema: { type: "string", minLength: 1, maxLength: 256 },
    description: "Client retry key for retriable create commands.",
  };
}

function requestBody(schemaRef) {
  return {
    required: true,
    content: {
      "application/json": {
        schema: { $ref: `#/components/schemas/${schemaRef}` },
      },
    },
  };
}

function operation({
  method,
  path: routePath,
  operationId,
  summary,
  resource,
  permission,
  auditEvent,
  apiAuthority,
  sourceRouteCrate,
  requestSchema,
  responseSchema,
  parameters = [],
  idempotent = false,
  requestContext,
}) {
  const op = {
    tags: [TAG],
    summary,
    operationId,
    parameters,
    responses: {
      200: jsonResponse(responseSchema),
      ...problemResponses(),
    },
    security: security(),
    "x-sdkwork-owner": OWNER,
    "x-sdkwork-api-authority": apiAuthority,
    "x-sdkwork-domain": DOMAIN,
    "x-sdkwork-resource": resource,
    "x-sdkwork-permission": permission,
    "x-sdkwork-tenant-scope": "tenant",
    "x-sdkwork-data-scope": "organization",
    "x-sdkwork-audit-event": auditEvent,
    "x-sdkwork-idempotent": idempotent,
    "x-sdkwork-deployment": "all",
    "x-sdkwork-request-context": requestContext,
    "x-sdkwork-source": `packages/native-rust/routes/${apiAuthority.endsWith("app-api") ? "app-api" : "backend-api"}/${sourceRouteCrate}`,
    "x-sdkwork-source-route-crate": sourceRouteCrate,
    "x-sdkwork-server-request-id": true,
  };

  if (requestSchema) {
    op.requestBody = requestBody(requestSchema);
  }

  return [method.toLowerCase(), routePath, op];
}

function manifestRoute({
  method,
  routePath,
  operationId,
  requestSchema = null,
  responseSchema,
  apiAuthority,
  sourceRouteCrate,
  permission,
  auditEvent,
  requestContext,
}) {
  return {
    method,
    path: routePath,
    operationId,
    tags: [TAG],
    auth: {
      mode: "dual-token",
      required: true,
      permission,
      tenantScope: "tenant",
      dataScope: "organization",
    },
    handler: {
      module: "crate::handlers",
      name: operationId.replaceAll(".", "_"),
    },
    schemas: {
      request: requestSchema,
      response: responseSchema,
      problem: "ProblemDetail",
    },
    ownership: {
      owner: OWNER,
      apiAuthority,
    },
    source: {
      file: "src/lib.rs",
      routeCrate: sourceRouteCrate,
    },
    extensions: {
      "x-sdkwork-audit-event": auditEvent,
      "x-sdkwork-request-context": requestContext,
    },
  };
}

function schemas() {
  return {
    ProblemDetail: {
      type: "object",
      additionalProperties: true,
      required: ["type", "title", "status"],
      properties: {
        type: { type: "string", format: "uri-reference" },
        title: { type: "string" },
        status: { type: "integer", minimum: 100, maximum: 599 },
        detail: { type: "string" },
        instance: { type: "string" },
        code: { type: "string" },
        traceId: { type: "string" },
        requestId: {
          type: "string",
          format: "uuid",
          description: "Server-owned request correlation id.",
        },
        errors: {
          type: "array",
          items: { $ref: "#/components/schemas/FieldError" },
        },
      },
    },
    FieldError: {
      type: "object",
      additionalProperties: false,
      required: ["field", "message"],
      properties: {
        field: { type: "string" },
        message: { type: "string" },
        code: { type: "string" },
      },
    },
    SearchDocument: {
      type: "object",
      additionalProperties: false,
      required: ["id", "title"],
      properties: {
        id: { type: "string" },
        title: { type: "string" },
        description: { type: "string" },
        enabled: { type: "boolean", default: true },
        group: { type: "string" },
        groupOrder: { type: "integer", format: "int32" },
        order: { type: "integer", format: "int32" },
        keywords: {
          type: "array",
          items: { type: "string" },
        },
        kind: { type: "string" },
        capability: { type: "string" },
        scope: { type: "string" },
        source: { type: "string" },
        metadata: {
          type: "object",
          additionalProperties: true,
        },
        updatedAt: { type: "string", format: "date-time" },
      },
    },
    SearchResult: {
      type: "object",
      additionalProperties: false,
      required: ["document", "matchedOn", "score"],
      properties: {
        document: { $ref: "#/components/schemas/SearchDocument" },
        matchedOn: {
          type: "string",
          enum: ["title", "keyword", "description", "group", "scope"],
        },
        score: { type: "integer", format: "int32" },
      },
    },
    SearchPageInfo: {
      type: "object",
      additionalProperties: false,
      required: ["page", "pageSize", "totalItems", "totalPages"],
      properties: {
        page: { type: "integer", format: "int32", minimum: 1 },
        pageSize: { type: "integer", format: "int32", minimum: 1, maximum: 200 },
        totalItems: { type: "integer", format: "int32", minimum: 0 },
        totalPages: { type: "integer", format: "int32", minimum: 1 },
      },
    },
    SearchQueryRequest: {
      type: "object",
      additionalProperties: false,
      required: ["q"],
      properties: {
        q: { type: "string" },
        page: { type: "integer", format: "int32", minimum: 1, default: 1 },
        pageSize: { type: "integer", format: "int32", minimum: 1, maximum: 200, default: 20 },
        providerId: { type: "string" },
        providerKind: { type: "string", enum: SEARCH_PROVIDER_KINDS },
        capabilityIds: {
          type: "array",
          items: { type: "string" },
        },
        groupIds: {
          type: "array",
          items: { type: "string" },
        },
        scopeIds: {
          type: "array",
          items: { type: "string" },
        },
      },
    },
    SearchQueryResponse: {
      type: "object",
      additionalProperties: false,
      required: ["items", "pageInfo", "q", "requestId"],
      properties: {
        items: {
          type: "array",
          items: { $ref: "#/components/schemas/SearchResult" },
        },
        pageInfo: { $ref: "#/components/schemas/SearchPageInfo" },
        q: { type: "string" },
        requestId: {
          type: "string",
          format: "uuid",
          description: "Server-owned request correlation id.",
        },
      },
    },
    SearchSuggestion: {
      type: "object",
      additionalProperties: false,
      required: ["text", "source", "score"],
      properties: {
        text: { type: "string" },
        source: { type: "string", enum: ["document", "query"] },
        score: { type: "integer", format: "int32" },
      },
    },
    SearchSuggestionsResponse: {
      type: "object",
      additionalProperties: false,
      required: ["items", "q", "requestId"],
      properties: {
        items: {
          type: "array",
          items: { $ref: "#/components/schemas/SearchSuggestion" },
        },
        q: { type: "string" },
        requestId: {
          type: "string",
          format: "uuid",
          description: "Server-owned request correlation id.",
        },
      },
    },
    SearchRecommendationContext: {
      type: "object",
      additionalProperties: false,
      properties: {
        q: { type: "string" },
        capabilityIds: {
          type: "array",
          items: { type: "string" },
        },
        groupIds: {
          type: "array",
          items: { type: "string" },
        },
        scopeIds: {
          type: "array",
          items: { type: "string" },
        },
        recentDocumentIds: {
          type: "array",
          items: { type: "string" },
        },
        placement: { type: "string" },
        userId: { type: "string" },
      },
    },
    SearchRecommendationRequest: {
      type: "object",
      additionalProperties: false,
      properties: {
        context: { $ref: "#/components/schemas/SearchRecommendationContext" },
        limit: { type: "integer", format: "int32", minimum: 1, maximum: 100, default: 10 },
        providerId: { type: "string" },
        providerKind: { type: "string", enum: SEARCH_PROVIDER_KINDS },
        strategyId: { type: "string", default: "default" },
      },
    },
    SearchRecommendationItem: {
      type: "object",
      additionalProperties: false,
      required: ["document", "reasonCodes", "score"],
      properties: {
        document: { $ref: "#/components/schemas/SearchDocument" },
        reasonCodes: {
          type: "array",
          items: { type: "string" },
        },
        score: { type: "integer", format: "int32" },
      },
    },
    SearchRecommendationResponse: {
      type: "object",
      additionalProperties: false,
      required: ["items", "requestId", "strategyId"],
      properties: {
        items: {
          type: "array",
          items: { $ref: "#/components/schemas/SearchRecommendationItem" },
        },
        requestId: {
          type: "string",
          format: "uuid",
          description: "Server-owned request correlation id.",
        },
        strategyId: { type: "string" },
      },
    },
    SearchPromotionContext: {
      type: "object",
      additionalProperties: false,
      required: ["placement"],
      properties: {
        placement: { type: "string" },
        q: { type: "string" },
        capabilityIds: {
          type: "array",
          items: { type: "string" },
        },
        groupIds: {
          type: "array",
          items: { type: "string" },
        },
        scopeIds: {
          type: "array",
          items: { type: "string" },
        },
      },
    },
    SearchPromotionRequest: {
      type: "object",
      additionalProperties: false,
      required: ["context"],
      properties: {
        context: { $ref: "#/components/schemas/SearchPromotionContext" },
        limit: { type: "integer", format: "int32", minimum: 1, maximum: 50, default: 10 },
        providerId: { type: "string" },
        providerKind: { type: "string", enum: SEARCH_PROVIDER_KINDS },
      },
    },
    SearchPromotionItem: {
      type: "object",
      additionalProperties: false,
      required: ["document", "placement", "reasonCodes", "score"],
      properties: {
        document: { $ref: "#/components/schemas/SearchDocument" },
        placement: { type: "string" },
        reasonCodes: {
          type: "array",
          items: { type: "string" },
        },
        score: { type: "integer", format: "int32" },
      },
    },
    SearchPromotionResponse: {
      type: "object",
      additionalProperties: false,
      required: ["items", "placement", "requestId"],
      properties: {
        items: {
          type: "array",
          items: { $ref: "#/components/schemas/SearchPromotionItem" },
        },
        placement: { type: "string" },
        requestId: {
          type: "string",
          format: "uuid",
          description: "Server-owned request correlation id.",
        },
      },
    },
    SearchUserEvent: {
      type: "object",
      additionalProperties: false,
      required: ["eventType", "occurredAt", "surface"],
      properties: {
        documentId: { type: "string" },
        eventType: {
          type: "string",
          enum: ["click", "conversion", "dismiss", "impression", "save", "view"],
        },
        indexId: { type: "string" },
        metadata: {
          type: "object",
          additionalProperties: true,
        },
        occurredAt: { type: "string", format: "date-time" },
        placement: { type: "string" },
        providerId: { type: "string" },
        q: { type: "string" },
        resultPosition: { type: "integer", format: "int32", minimum: 0 },
        surface: { type: "string", enum: ["app", "backend", "local"] },
      },
    },
    SearchUserEventResponse: {
      type: "object",
      additionalProperties: false,
      required: ["accepted", "requestId"],
      properties: {
        accepted: { type: "boolean" },
        requestId: {
          type: "string",
          format: "uuid",
          description: "Server-owned request correlation id.",
        },
      },
    },
    SearchRecentQuery: {
      type: "object",
      additionalProperties: false,
      required: ["q", "lastUsedAt", "resultCount"],
      properties: {
        q: { type: "string" },
        lastUsedAt: { type: "string", format: "date-time" },
        resultCount: { type: "integer", format: "int32", minimum: 0 },
      },
    },
    SearchRecentQueryListResponse: {
      type: "object",
      additionalProperties: false,
      required: ["items", "requestId"],
      properties: {
        items: {
          type: "array",
          items: { $ref: "#/components/schemas/SearchRecentQuery" },
        },
        requestId: {
          type: "string",
          format: "uuid",
          description: "Server-owned request correlation id.",
        },
      },
    },
    SearchSemanticQueryRequest: {
      type: "object",
      additionalProperties: false,
      required: ["q"],
      properties: {
        q: { type: "string" },
        embeddingProvider: { type: "string", default: "postgresql" },
        limit: { type: "integer", format: "int32", minimum: 1, maximum: 100, default: 10 },
        providerId: { type: "string" },
        providerKind: { type: "string", enum: SEARCH_PROVIDER_KINDS },
        semanticProfileId: { type: "string", default: "default" },
        capabilityIds: {
          type: "array",
          items: { type: "string" },
        },
        groupIds: {
          type: "array",
          items: { type: "string" },
        },
        scopeIds: {
          type: "array",
          items: { type: "string" },
        },
      },
    },
    SearchSemanticResult: {
      type: "object",
      additionalProperties: false,
      required: ["document", "lexicalScore", "reasonCodes", "score"],
      properties: {
        document: { $ref: "#/components/schemas/SearchDocument" },
        lexicalScore: { type: "integer", format: "int32" },
        semanticScore: { type: "integer", format: "int32" },
        reasonCodes: {
          type: "array",
          items: { type: "string" },
        },
        score: { type: "integer", format: "int32" },
      },
    },
    SearchSemanticQueryResponse: {
      type: "object",
      additionalProperties: false,
      required: ["embeddingProvider", "items", "mode", "q", "requestId", "semanticProfileId"],
      properties: {
        embeddingProvider: { type: "string" },
        items: {
          type: "array",
          items: { $ref: "#/components/schemas/SearchSemanticResult" },
        },
        mode: { type: "string", enum: ["hybrid", "semantic"] },
        q: { type: "string" },
        requestId: {
          type: "string",
          format: "uuid",
          description: "Server-owned request correlation id.",
        },
        semanticProfileId: { type: "string" },
      },
    },
    SearchIndex: {
      type: "object",
      additionalProperties: false,
      required: ["indexId", "name", "documentCount", "createdAt", "updatedAt"],
      properties: {
        indexId: { type: "string" },
        name: { type: "string" },
        description: { type: "string" },
        analyzer: { type: "string" },
        documentCount: { type: "integer", format: "int32", minimum: 0 },
        createdAt: { type: "string", format: "date-time" },
        updatedAt: { type: "string", format: "date-time" },
      },
    },
    SearchIndexListResponse: {
      type: "object",
      additionalProperties: false,
      required: ["items", "pageInfo", "requestId"],
      properties: {
        items: {
          type: "array",
          items: { $ref: "#/components/schemas/SearchIndex" },
        },
        pageInfo: { $ref: "#/components/schemas/SearchPageInfo" },
        requestId: {
          type: "string",
          format: "uuid",
          description: "Server-owned request correlation id.",
        },
      },
    },
    SearchIndexCreateRequest: {
      type: "object",
      additionalProperties: false,
      required: ["indexId", "name"],
      properties: {
        indexId: { type: "string" },
        name: { type: "string" },
        description: { type: "string" },
        analyzer: { type: "string" },
      },
    },
    SearchIndexUpdateRequest: {
      type: "object",
      additionalProperties: false,
      properties: {
        name: { type: "string" },
        description: { type: "string" },
        analyzer: { type: "string" },
        status: { type: "string", enum: ["active", "archived", "draft", "paused"] },
      },
    },
    SearchIndexResponse: {
      type: "object",
      additionalProperties: false,
      required: ["index", "requestId"],
      properties: {
        index: { $ref: "#/components/schemas/SearchIndex" },
        requestId: {
          type: "string",
          format: "uuid",
          description: "Server-owned request correlation id.",
        },
      },
    },
    SearchIndexDeleteResponse: {
      type: "object",
      additionalProperties: false,
      required: ["deleted", "indexId", "requestId"],
      properties: {
        deleted: { type: "boolean" },
        indexId: { type: "string" },
        requestId: {
          type: "string",
          format: "uuid",
          description: "Server-owned request correlation id.",
        },
      },
    },
    SearchDocumentUpsertRequest: {
      type: "object",
      additionalProperties: false,
      required: ["document"],
      properties: {
        document: { $ref: "#/components/schemas/SearchDocument" },
      },
    },
    SearchDocumentBulkUpsertRequest: {
      type: "object",
      additionalProperties: false,
      required: ["documents"],
      properties: {
        documents: {
          type: "array",
          minItems: 1,
          maxItems: 1000,
          items: { $ref: "#/components/schemas/SearchDocument" },
        },
      },
    },
    SearchDocumentBulkUpsertResponse: {
      type: "object",
      additionalProperties: false,
      required: ["indexedAt", "requestId", "upsertedCount"],
      properties: {
        indexedAt: { type: "string", format: "date-time" },
        requestId: {
          type: "string",
          format: "uuid",
          description: "Server-owned request correlation id.",
        },
        upsertedCount: { type: "integer", format: "int32", minimum: 0 },
      },
    },
    SearchDocumentResponse: {
      type: "object",
      additionalProperties: false,
      required: ["document", "indexedAt", "requestId"],
      properties: {
        document: { $ref: "#/components/schemas/SearchDocument" },
        indexedAt: { type: "string", format: "date-time" },
        requestId: {
          type: "string",
          format: "uuid",
          description: "Server-owned request correlation id.",
        },
      },
    },
    SearchDocumentDeleteResponse: {
      type: "object",
      additionalProperties: false,
      required: ["indexId", "documentId", "deleted", "requestId"],
      properties: {
        indexId: { type: "string" },
        documentId: { type: "string" },
        deleted: { type: "boolean" },
        requestId: {
          type: "string",
          format: "uuid",
          description: "Server-owned request correlation id.",
        },
      },
    },
    SearchSynonym: {
      type: "object",
      additionalProperties: false,
      required: ["synonymId", "setKey", "term", "synonyms", "status"],
      properties: {
        synonymId: { type: "string" },
        setKey: { type: "string" },
        term: { type: "string" },
        synonyms: {
          type: "array",
          items: { type: "string" },
        },
        matchType: { type: "string", enum: ["equivalent", "one_way"] },
        status: { type: "string", enum: ["active", "archived", "draft", "paused"] },
      },
    },
    SearchSynonymCreateRequest: {
      type: "object",
      additionalProperties: false,
      required: ["setKey", "term", "synonyms"],
      properties: {
        setKey: { type: "string" },
        term: { type: "string" },
        synonyms: {
          type: "array",
          minItems: 1,
          items: { type: "string" },
        },
        matchType: { type: "string", enum: ["equivalent", "one_way"], default: "equivalent" },
      },
    },
    SearchSynonymListResponse: {
      type: "object",
      additionalProperties: false,
      required: ["items", "pageInfo", "requestId"],
      properties: {
        items: {
          type: "array",
          items: { $ref: "#/components/schemas/SearchSynonym" },
        },
        pageInfo: { $ref: "#/components/schemas/SearchPageInfo" },
        requestId: {
          type: "string",
          format: "uuid",
          description: "Server-owned request correlation id.",
        },
      },
    },
    SearchSynonymResponse: {
      type: "object",
      additionalProperties: false,
      required: ["requestId", "synonym"],
      properties: {
        requestId: {
          type: "string",
          format: "uuid",
          description: "Server-owned request correlation id.",
        },
        synonym: { $ref: "#/components/schemas/SearchSynonym" },
      },
    },
    SearchSynonymDeleteResponse: {
      type: "object",
      additionalProperties: false,
      required: ["deleted", "requestId", "synonymId"],
      properties: {
        deleted: { type: "boolean" },
        requestId: {
          type: "string",
          format: "uuid",
          description: "Server-owned request correlation id.",
        },
        synonymId: { type: "string" },
      },
    },
    SearchRankingProfile: {
      type: "object",
      additionalProperties: false,
      required: ["profileId", "profileKey", "title", "status"],
      properties: {
        profileId: { type: "string" },
        profileKey: { type: "string" },
        title: { type: "string" },
        weights: {
          type: "object",
          additionalProperties: true,
        },
        rule: {
          type: "object",
          additionalProperties: true,
        },
        status: { type: "string", enum: ["active", "archived", "draft", "paused"] },
      },
    },
    SearchRankingProfileCreateRequest: {
      type: "object",
      additionalProperties: false,
      required: ["profileKey", "title"],
      properties: {
        profileKey: { type: "string" },
        title: { type: "string" },
        weights: {
          type: "object",
          additionalProperties: true,
        },
        rule: {
          type: "object",
          additionalProperties: true,
        },
      },
    },
    SearchRankingProfileUpdateRequest: {
      type: "object",
      additionalProperties: false,
      properties: {
        title: { type: "string" },
        weights: {
          type: "object",
          additionalProperties: true,
        },
        rule: {
          type: "object",
          additionalProperties: true,
        },
        status: { type: "string", enum: ["active", "archived", "draft", "paused"] },
      },
    },
    SearchRankingProfileListResponse: {
      type: "object",
      additionalProperties: false,
      required: ["items", "pageInfo", "requestId"],
      properties: {
        items: {
          type: "array",
          items: { $ref: "#/components/schemas/SearchRankingProfile" },
        },
        pageInfo: { $ref: "#/components/schemas/SearchPageInfo" },
        requestId: {
          type: "string",
          format: "uuid",
          description: "Server-owned request correlation id.",
        },
      },
    },
    SearchRankingProfileResponse: {
      type: "object",
      additionalProperties: false,
      required: ["profile", "requestId"],
      properties: {
        profile: { $ref: "#/components/schemas/SearchRankingProfile" },
        requestId: {
          type: "string",
          format: "uuid",
          description: "Server-owned request correlation id.",
        },
      },
    },
    SearchRecommendationStrategy: {
      type: "object",
      additionalProperties: false,
      required: ["strategyId", "strategyKey", "strategyType", "title", "status"],
      properties: {
        strategyId: { type: "string" },
        strategyKey: { type: "string" },
        strategyType: {
          type: "string",
          enum: ["collaborative", "content", "hybrid", "popular", "semantic"],
        },
        title: { type: "string" },
        config: {
          type: "object",
          additionalProperties: true,
        },
        status: { type: "string", enum: ["active", "archived", "draft", "paused"] },
      },
    },
    SearchRecommendationStrategyCreateRequest: {
      type: "object",
      additionalProperties: false,
      required: ["strategyKey", "title"],
      properties: {
        strategyKey: { type: "string" },
        strategyType: {
          type: "string",
          enum: ["collaborative", "content", "hybrid", "popular", "semantic"],
          default: "hybrid",
        },
        title: { type: "string" },
        config: {
          type: "object",
          additionalProperties: true,
        },
      },
    },
    SearchRecommendationStrategyUpdateRequest: {
      type: "object",
      additionalProperties: false,
      properties: {
        strategyType: {
          type: "string",
          enum: ["collaborative", "content", "hybrid", "popular", "semantic"],
        },
        title: { type: "string" },
        config: {
          type: "object",
          additionalProperties: true,
        },
        status: { type: "string", enum: ["active", "archived", "draft", "paused"] },
      },
    },
    SearchRecommendationStrategyListResponse: {
      type: "object",
      additionalProperties: false,
      required: ["items", "pageInfo", "requestId"],
      properties: {
        items: {
          type: "array",
          items: { $ref: "#/components/schemas/SearchRecommendationStrategy" },
        },
        pageInfo: { $ref: "#/components/schemas/SearchPageInfo" },
        requestId: {
          type: "string",
          format: "uuid",
          description: "Server-owned request correlation id.",
        },
      },
    },
    SearchRecommendationStrategyResponse: {
      type: "object",
      additionalProperties: false,
      required: ["requestId", "strategy"],
      properties: {
        requestId: {
          type: "string",
          format: "uuid",
          description: "Server-owned request correlation id.",
        },
        strategy: { $ref: "#/components/schemas/SearchRecommendationStrategy" },
      },
    },
    SearchPromotionAdmin: {
      type: "object",
      additionalProperties: false,
      required: ["promotionId", "placement", "documentId", "status"],
      properties: {
        promotionId: { type: "string" },
        placement: { type: "string" },
        documentId: { type: "string" },
        indexId: { type: "string" },
        priority: { type: "integer", format: "int32", default: 0 },
        rule: {
          type: "object",
          additionalProperties: true,
        },
        status: { type: "string", enum: ["active", "archived", "draft", "paused"] },
        activeFrom: { type: "string", format: "date-time" },
        activeUntil: { type: "string", format: "date-time" },
      },
    },
    SearchPromotionCreateRequest: {
      type: "object",
      additionalProperties: false,
      required: ["documentId", "placement"],
      properties: {
        documentId: { type: "string" },
        indexId: { type: "string" },
        placement: { type: "string" },
        priority: { type: "integer", format: "int32", default: 0 },
        rule: {
          type: "object",
          additionalProperties: true,
        },
        activeFrom: { type: "string", format: "date-time" },
        activeUntil: { type: "string", format: "date-time" },
      },
    },
    SearchPromotionUpdateRequest: {
      type: "object",
      additionalProperties: false,
      properties: {
        priority: { type: "integer", format: "int32" },
        rule: {
          type: "object",
          additionalProperties: true,
        },
        status: { type: "string", enum: ["active", "archived", "draft", "paused"] },
        activeFrom: { type: "string", format: "date-time" },
        activeUntil: { type: "string", format: "date-time" },
      },
    },
    SearchPromotionListResponse: {
      type: "object",
      additionalProperties: false,
      required: ["items", "pageInfo", "requestId"],
      properties: {
        items: {
          type: "array",
          items: { $ref: "#/components/schemas/SearchPromotionAdmin" },
        },
        pageInfo: { $ref: "#/components/schemas/SearchPageInfo" },
        requestId: {
          type: "string",
          format: "uuid",
          description: "Server-owned request correlation id.",
        },
      },
    },
    SearchPromotionAdminResponse: {
      type: "object",
      additionalProperties: false,
      required: ["promotion", "requestId"],
      properties: {
        promotion: { $ref: "#/components/schemas/SearchPromotionAdmin" },
        requestId: {
          type: "string",
          format: "uuid",
          description: "Server-owned request correlation id.",
        },
      },
    },
    SearchPromotionDeleteResponse: {
      type: "object",
      additionalProperties: false,
      required: ["deleted", "promotionId", "requestId"],
      properties: {
        deleted: { type: "boolean" },
        promotionId: { type: "string" },
        requestId: {
          type: "string",
          format: "uuid",
          description: "Server-owned request correlation id.",
        },
      },
    },
    SearchEmbeddingJob: {
      type: "object",
      additionalProperties: false,
      required: ["jobId", "indexId", "status"],
      properties: {
        jobId: { type: "string" },
        indexId: { type: "string" },
        documentId: { type: "string" },
        provider: { type: "string" },
        model: { type: "string" },
        status: { type: "string", enum: ["failed", "pending", "running", "succeeded"] },
        scheduledAt: { type: "string", format: "date-time" },
        startedAt: { type: "string", format: "date-time" },
        finishedAt: { type: "string", format: "date-time" },
        errorSummary: { type: "string" },
      },
    },
    SearchEmbeddingJobCreateRequest: {
      type: "object",
      additionalProperties: false,
      required: ["indexId"],
      properties: {
        indexId: { type: "string" },
        documentId: { type: "string" },
        provider: { type: "string", default: "postgresql" },
        model: { type: "string" },
      },
    },
    SearchEmbeddingJobListResponse: {
      type: "object",
      additionalProperties: false,
      required: ["items", "pageInfo", "requestId"],
      properties: {
        items: {
          type: "array",
          items: { $ref: "#/components/schemas/SearchEmbeddingJob" },
        },
        pageInfo: { $ref: "#/components/schemas/SearchPageInfo" },
        requestId: {
          type: "string",
          format: "uuid",
          description: "Server-owned request correlation id.",
        },
      },
    },
    SearchEmbeddingJobResponse: {
      type: "object",
      additionalProperties: false,
      required: ["job", "requestId"],
      properties: {
        job: { $ref: "#/components/schemas/SearchEmbeddingJob" },
        requestId: {
          type: "string",
          format: "uuid",
          description: "Server-owned request correlation id.",
        },
      },
    },
    SearchAbExperiment: {
      type: "object",
      additionalProperties: false,
      required: ["experimentId", "experimentKey", "title", "status"],
      properties: {
        experimentId: { type: "string" },
        experimentKey: { type: "string" },
        title: { type: "string" },
        target: {
          type: "object",
          additionalProperties: true,
        },
        variants: {
          type: "array",
          items: {
            type: "object",
            additionalProperties: true,
          },
        },
        status: { type: "string", enum: ["active", "archived", "draft", "paused"] },
        activeFrom: { type: "string", format: "date-time" },
        activeUntil: { type: "string", format: "date-time" },
      },
    },
    SearchAbExperimentCreateRequest: {
      type: "object",
      additionalProperties: false,
      required: ["experimentKey", "title", "variants"],
      properties: {
        experimentKey: { type: "string" },
        title: { type: "string" },
        target: {
          type: "object",
          additionalProperties: true,
        },
        variants: {
          type: "array",
          minItems: 2,
          items: {
            type: "object",
            additionalProperties: true,
          },
        },
        activeFrom: { type: "string", format: "date-time" },
        activeUntil: { type: "string", format: "date-time" },
      },
    },
    SearchAbExperimentUpdateRequest: {
      type: "object",
      additionalProperties: false,
      properties: {
        title: { type: "string" },
        target: {
          type: "object",
          additionalProperties: true,
        },
        variants: {
          type: "array",
          items: {
            type: "object",
            additionalProperties: true,
          },
        },
        status: { type: "string", enum: ["active", "archived", "draft", "paused"] },
        activeFrom: { type: "string", format: "date-time" },
        activeUntil: { type: "string", format: "date-time" },
      },
    },
    SearchAbExperimentListResponse: {
      type: "object",
      additionalProperties: false,
      required: ["items", "pageInfo", "requestId"],
      properties: {
        items: {
          type: "array",
          items: { $ref: "#/components/schemas/SearchAbExperiment" },
        },
        pageInfo: { $ref: "#/components/schemas/SearchPageInfo" },
        requestId: {
          type: "string",
          format: "uuid",
          description: "Server-owned request correlation id.",
        },
      },
    },
    SearchAbExperimentResponse: {
      type: "object",
      additionalProperties: false,
      required: ["experiment", "requestId"],
      properties: {
        experiment: { $ref: "#/components/schemas/SearchAbExperiment" },
        requestId: {
          type: "string",
          format: "uuid",
          description: "Server-owned request correlation id.",
        },
      },
    },
    SearchAbAssignmentRequest: {
      type: "object",
      additionalProperties: false,
      required: ["subjectId", "subjectType"],
      properties: {
        subjectId: { type: "string" },
        subjectType: { type: "string" },
      },
    },
    SearchAbAssignmentResponse: {
      type: "object",
      additionalProperties: false,
      required: ["assignedAt", "experimentId", "requestId", "subjectId", "variantKey"],
      properties: {
        assignedAt: { type: "string", format: "date-time" },
        experimentId: { type: "string" },
        requestId: {
          type: "string",
          format: "uuid",
          description: "Server-owned request correlation id.",
        },
        subjectId: { type: "string" },
        variantKey: { type: "string" },
      },
    },
    SearchRebuildJobRequest: {
      type: "object",
      additionalProperties: false,
      required: ["indexId"],
      properties: {
        indexId: { type: "string" },
        full: { type: "boolean", default: true },
      },
    },
    SearchIndexJobResponse: {
      type: "object",
      additionalProperties: false,
      required: ["jobId", "requestId", "status"],
      properties: {
        jobId: { type: "string" },
        requestId: {
          type: "string",
          format: "uuid",
          description: "Server-owned request correlation id.",
        },
        status: { type: "string", enum: ["failed", "pending", "running", "succeeded"] },
      },
    },
    SearchAnalyticsOverview: {
      type: "object",
      additionalProperties: false,
      required: [
        "clickThroughRate",
        "failedEmbeddingJobs",
        "indexedDocuments",
        "promotionClicks",
        "recommendationClicks",
        "requestId",
        "searchQueries",
      ],
      properties: {
        clickThroughRate: {
          type: "string",
          description: "Decimal ratio serialized as string for SDK precision safety.",
        },
        failedEmbeddingJobs: { type: "integer", format: "int32", minimum: 0 },
        indexedDocuments: { type: "integer", format: "int32", minimum: 0 },
        promotionClicks: { type: "integer", format: "int32", minimum: 0 },
        recommendationClicks: { type: "integer", format: "int32", minimum: 0 },
        requestId: {
          type: "string",
          format: "uuid",
          description: "Server-owned request correlation id.",
        },
        searchQueries: { type: "integer", format: "int32", minimum: 0 },
      },
    },
    SearchProvider: {
      type: "object",
      additionalProperties: false,
      required: [
        "capabilities",
        "defaultFor",
        "displayName",
        "kind",
        "priority",
        "providerId",
        "status",
      ],
      properties: {
        providerId: { type: "string" },
        kind: { type: "string", enum: SEARCH_PROVIDER_KINDS },
        displayName: { type: "string" },
        capabilities: {
          type: "array",
          items: { type: "string", enum: SEARCH_PROVIDER_CAPABILITIES },
        },
        defaultFor: {
          type: "array",
          items: { type: "string", enum: SEARCH_PROVIDER_CAPABILITIES },
        },
        config: {
          type: "object",
          additionalProperties: true,
          description:
            "Non-secret provider configuration safe to return in backend API responses. Credentials, API keys, tokens, passwords, private keys, and connection secrets are never returned here.",
        },
        metadata: {
          type: "object",
          additionalProperties: true,
        },
        priority: { type: "integer", format: "int32", minimum: 0, default: 0 },
        status: { type: "string", enum: SEARCH_PROVIDER_STATUSES },
        healthStatus: { type: "string", enum: SEARCH_PROVIDER_HEALTH_STATUSES },
        lastCheckedAt: { type: "string", format: "date-time" },
        lastErrorSummary: { type: "string" },
        createdAt: { type: "string", format: "date-time" },
        updatedAt: { type: "string", format: "date-time" },
      },
    },
    SearchProviderCreateRequest: {
      type: "object",
      additionalProperties: false,
      required: ["capabilities", "displayName", "kind", "providerId"],
      properties: {
        providerId: { type: "string" },
        kind: { type: "string", enum: SEARCH_PROVIDER_KINDS },
        displayName: { type: "string" },
        capabilities: {
          type: "array",
          minItems: 1,
          items: { type: "string", enum: SEARCH_PROVIDER_CAPABILITIES },
        },
        defaultFor: {
          type: "array",
          items: { type: "string", enum: SEARCH_PROVIDER_CAPABILITIES },
        },
        config: {
          type: "object",
          additionalProperties: true,
          description:
            "Non-secret provider configuration such as endpoint, index naming, locale, timeout, routing, and feature flags.",
        },
        secretConfig: {
          type: "object",
          additionalProperties: true,
          writeOnly: true,
          description:
            "Provider credential configuration. This field is write-only and must be encrypted or stored through the provider secret store; it is never returned by SearchProvider responses.",
        },
        metadata: {
          type: "object",
          additionalProperties: true,
        },
        priority: { type: "integer", format: "int32", minimum: 0, default: 0 },
        status: { type: "string", enum: SEARCH_PROVIDER_STATUSES, default: "active" },
      },
    },
    SearchProviderUpdateRequest: {
      type: "object",
      additionalProperties: false,
      properties: {
        displayName: { type: "string" },
        capabilities: {
          type: "array",
          minItems: 1,
          items: { type: "string", enum: SEARCH_PROVIDER_CAPABILITIES },
        },
        defaultFor: {
          type: "array",
          items: { type: "string", enum: SEARCH_PROVIDER_CAPABILITIES },
        },
        config: {
          type: "object",
          additionalProperties: true,
          description:
            "Non-secret provider configuration such as endpoint, index naming, locale, timeout, routing, and feature flags.",
        },
        secretConfig: {
          type: "object",
          additionalProperties: true,
          writeOnly: true,
          description:
            "Provider credential configuration. This field is write-only and must be encrypted or stored through the provider secret store; it is never returned by SearchProvider responses.",
        },
        metadata: {
          type: "object",
          additionalProperties: true,
        },
        priority: { type: "integer", format: "int32", minimum: 0 },
        status: { type: "string", enum: SEARCH_PROVIDER_STATUSES },
      },
    },
    SearchProviderListResponse: {
      type: "object",
      additionalProperties: false,
      required: ["items", "pageInfo", "requestId"],
      properties: {
        items: {
          type: "array",
          items: { $ref: "#/components/schemas/SearchProvider" },
        },
        pageInfo: { $ref: "#/components/schemas/SearchPageInfo" },
        requestId: {
          type: "string",
          format: "uuid",
          description: "Server-owned request correlation id.",
        },
      },
    },
    SearchProviderResponse: {
      type: "object",
      additionalProperties: false,
      required: ["provider", "requestId"],
      properties: {
        provider: { $ref: "#/components/schemas/SearchProvider" },
        requestId: {
          type: "string",
          format: "uuid",
          description: "Server-owned request correlation id.",
        },
      },
    },
    SearchProviderHealthCheck: {
      type: "object",
      additionalProperties: false,
      required: ["checkedAt", "providerId", "status"],
      properties: {
        providerId: { type: "string" },
        status: { type: "string", enum: SEARCH_PROVIDER_HEALTH_STATUSES },
        checkedAt: { type: "string", format: "date-time" },
        latencyMs: { type: "integer", format: "int32", minimum: 0 },
        details: {
          type: "object",
          additionalProperties: true,
        },
        errorSummary: { type: "string" },
      },
    },
    SearchProviderHealthCheckResponse: {
      type: "object",
      additionalProperties: false,
      required: ["healthCheck", "requestId"],
      properties: {
        healthCheck: { $ref: "#/components/schemas/SearchProviderHealthCheck" },
        requestId: {
          type: "string",
          format: "uuid",
          description: "Server-owned request correlation id.",
        },
      },
    },
  };
}

function collectSchemaRefs(schema, refs = new Set()) {
  if (!schema || typeof schema !== "object") {
    return refs;
  }

  if (typeof schema.$ref === "string") {
    const schemaName = schema.$ref.replace("#/components/schemas/", "");
    if (schemaName) {
      refs.add(schemaName);
    }
  }

  for (const value of Object.values(schema)) {
    if (Array.isArray(value)) {
      for (const item of value) {
        collectSchemaRefs(item, refs);
      }
      continue;
    }
    collectSchemaRefs(value, refs);
  }

  return refs;
}

function pickSchemasForRoutes(routes) {
  const allSchemas = schemas();
  const names = new Set(["ProblemDetail", "FieldError"]);
  const queue = [];

  for (const route of routes) {
    if (route.requestSchema) {
      queue.push(route.requestSchema);
    }
    queue.push(route.responseSchema);
  }

  while (queue.length > 0) {
    const schemaName = queue.shift();
    if (!schemaName || names.has(schemaName)) {
      continue;
    }

    names.add(schemaName);
    const schema = allSchemas[schemaName];
    if (!schema) {
      throw new Error(`Route references unknown schema: ${schemaName}`);
    }
    for (const referencedName of collectSchemaRefs(schema)) {
      if (!names.has(referencedName)) {
        queue.push(referencedName);
      }
    }
  }

  return Object.fromEntries(Array.from(names).map((schemaName) => [schemaName, allSchemas[schemaName]]));
}

function buildOpenApi({ title, description, apiAuthority, sdkFamily, prefix, routes, requestContext }) {
  const paths = {};

  for (const route of routes) {
    const [method, routePath, op] = operation({
      method: route.method,
      path: route.path,
      operationId: route.operationId,
      summary: route.summary,
      resource: route.resource,
      permission: route.permission,
      auditEvent: route.auditEvent,
      apiAuthority,
      sourceRouteCrate: route.sourceRouteCrate,
      requestSchema: route.requestSchema,
      responseSchema: route.responseSchema,
      parameters: route.parameters,
      idempotent: route.idempotent,
      requestContext,
    });

    paths[routePath] = {
      ...(paths[routePath] ?? {}),
      [method]: op,
    };
  }

  return {
    openapi: "3.1.2",
    info: {
      title,
      version: VERSION,
      description,
      "x-sdkwork-api-authority": apiAuthority,
      "x-sdkwork-sdk-family": sdkFamily,
      "x-sdkwork-audience": apiAuthority.endsWith("app-api")
        ? "App, desktop, mobile, H5, and user-facing clients"
        : "Backend console, operators, control plane, and admin integrations",
    },
    servers: [
      {
        url: "http://localhost:8080",
        description: "Local sdkwork-search runtime",
      },
    ],
    tags: [
      {
        name: TAG,
        description: "Search API resources.",
        "x-sdk-nested-resource-surface": true,
      },
    ],
    security: security(),
    paths,
    components: {
      securitySchemes: {
        AuthToken: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
          description: "SDKWork auth token carried as Authorization: Bearer <auth_token>.",
        },
        AccessToken: {
          type: "apiKey",
          in: "header",
          name: "Access-Token",
          description: "SDKWork access isolation token.",
        },
      },
      schemas: pickSchemasForRoutes(routes),
    },
    "x-sdkwork-materialized-from": [
      {
        owner: OWNER,
        path: `packages/native-rust/routes/${apiAuthority.endsWith("app-api") ? "app-api" : "backend-api"}/${routes[0].sourceRouteCrate}`,
      },
    ],
    "x-sdkwork-request-context": {
      contextObject: requestContext,
      serverRequestId: "server-owned",
      clientRequestIdHeader: "forbidden",
      tenantSource: "AuthToken + AccessToken",
      organizationSource: "AuthToken + AccessToken",
      userSource: "AuthToken + AccessToken",
    },
  };
}

function buildAssembly({ family, title, apiAuthority, prefix, sdkType, packageName }) {
  return {
    workspace: family,
    title,
    apiVersion: VERSION,
    openapiVersion: "3.1.2",
    authoritySpec: `openapi/${apiAuthority}.openapi.yaml`,
    generationInputSpec: `openapi/${apiAuthority}.sdkgen.yaml`,
    derivedSpecs: {
      default: `openapi/${apiAuthority}.sdkgen.yaml`,
    },
    sdkOwner: OWNER,
    apiAuthority,
    sdkDependencies: [],
    discoverySurface: {
      sdkTarget: sdkType,
      apiPrefix: prefix,
      schemaUrl: `${prefix.replace(/\/api$/, "")}/openapi.json`,
      generatedProtocols: ["http-openapi"],
      manualTransports: [],
    },
    languages: Object.entries(LANGUAGE_MATRIX).map(([language, meta]) => ({
      language,
      workspace: `${family}-${language}`,
      generationState: "ready",
      releaseState: "not_published",
      packagePath: `${family}-${language}/generated/server-openapi`,
      manifestPath: `${family}-${language}/generated/server-openapi/${meta.manifest}`,
      name: packageName,
      version: VERSION,
      description: `Generator-owned ${language} transport SDK for ${title}.`,
      generatedPath: `${family}-${language}/generated/server-openapi`,
    })),
    metadata: {
      managedBy: "sdks/materialize-search-v3-openapi-boundaries.mjs",
      standardVersion: "2026-06-06",
    },
  };
}

function buildComponentSpec({ family, apiAuthority, prefix, sdkType }) {
  return {
    schemaVersion: 1,
    name: family,
    type: "sdk-family",
    domain: DOMAIN,
    apiAuthority,
    apiPrefix: prefix,
    sdkType,
    languages: Object.keys(LANGUAGE_MATRIX),
    generator: {
      package: "@sdkwork/sdk-generator",
      entrypoint: GENERATOR_PATH,
      standardProfile: "sdkwork-v3",
    },
    contracts: {
      sdkDependencies: [],
    },
    auth: {
      mode: "dual-token",
      authTokenHeader: "Authorization",
      accessTokenHeader: "Access-Token",
      requestIdOwnership: "server",
    },
    requestContextFramework: {
      apiSurface: sdkType === "app" ? "app-api" : "backend-api",
      contextType: sdkType === "app" ? "AppRequestContext" : "BackendRequestContext",
      resolver: "AuthTokenParser + AccessTokenParser",
    },
  };
}

async function main() {
  const appRoutes = [
    {
      method: "POST",
      path: "/app/v3/api/search/queries",
      operationId: "search.queries.create",
      summary: "Create a search query.",
      resource: "search.queries",
      permission: "search.queries.create",
      auditEvent: "search.query.create",
      requestSchema: "SearchQueryRequest",
      responseSchema: "SearchQueryResponse",
      sourceRouteCrate: "sdkwork-routes-search-app-api",
      parameters: [],
      idempotent: false,
    },
    {
      method: "GET",
      path: "/app/v3/api/search/indexes",
      operationId: "search.indexes.list",
      summary: "List search indexes visible to the current app principal.",
      resource: "search.indexes",
      permission: "search.indexes.read",
      auditEvent: "search.index.list",
      requestSchema: null,
      responseSchema: "SearchIndexListResponse",
      sourceRouteCrate: "sdkwork-routes-search-app-api",
      parameters: pageQueryParameters(),
      idempotent: true,
    },
    {
      method: "GET",
      path: "/app/v3/api/search/suggestions",
      operationId: "search.suggestions.list",
      summary: "List search suggestions for app clients.",
      resource: "search.suggestions",
      permission: "search.suggestions.read",
      auditEvent: "search.suggestion.list",
      requestSchema: null,
      responseSchema: "SearchSuggestionsResponse",
      sourceRouteCrate: "sdkwork-routes-search-app-api",
      parameters: suggestionQueryParameters(),
      idempotent: true,
    },
    {
      method: "POST",
      path: "/app/v3/api/search/recommendations",
      operationId: "search.recommendations.create",
      summary: "Create an explainable recommendation response.",
      resource: "search.recommendations",
      permission: "search.recommendations.create",
      auditEvent: "search.recommendation.create",
      requestSchema: "SearchRecommendationRequest",
      responseSchema: "SearchRecommendationResponse",
      sourceRouteCrate: "sdkwork-routes-search-app-api",
      parameters: [],
      idempotent: false,
    },
    {
      method: "POST",
      path: "/app/v3/api/search/promotions",
      operationId: "search.promotions.create",
      summary: "Create a promotion delivery response for an app placement.",
      resource: "search.promotions",
      permission: "search.promotions.create",
      auditEvent: "search.promotion.delivery.create",
      requestSchema: "SearchPromotionRequest",
      responseSchema: "SearchPromotionResponse",
      sourceRouteCrate: "sdkwork-routes-search-app-api",
      parameters: [],
      idempotent: false,
    },
    {
      method: "POST",
      path: "/app/v3/api/search/events",
      operationId: "search.events.create",
      summary: "Record a search or recommendation feedback event.",
      resource: "search.events",
      permission: "search.events.create",
      auditEvent: "search.event.create",
      requestSchema: "SearchUserEvent",
      responseSchema: "SearchUserEventResponse",
      sourceRouteCrate: "sdkwork-routes-search-app-api",
      parameters: [],
      idempotent: false,
    },
    {
      method: "GET",
      path: "/app/v3/api/search/recent_queries",
      operationId: "search.recentQueries.list",
      summary: "List recent search queries for the current app principal.",
      resource: "search.recentQueries",
      permission: "search.recent_queries.read",
      auditEvent: "search.recent_query.list",
      requestSchema: null,
      responseSchema: "SearchRecentQueryListResponse",
      sourceRouteCrate: "sdkwork-routes-search-app-api",
      parameters: pageQueryParameters(),
      idempotent: true,
    },
    {
      method: "POST",
      path: "/app/v3/api/search/semantic_queries",
      operationId: "search.semanticQueries.create",
      summary: "Create a semantic search query with lexical fallback.",
      resource: "search.semanticQueries",
      permission: "search.semantic_queries.create",
      auditEvent: "search.semantic_query.create",
      requestSchema: "SearchSemanticQueryRequest",
      responseSchema: "SearchSemanticQueryResponse",
      sourceRouteCrate: "sdkwork-routes-search-app-api",
      parameters: [],
      idempotent: false,
    },
  ];

  const backendRoutes = [
    {
      method: "GET",
      path: "/backend/v3/api/search/indexes",
      operationId: "search.indexes.list",
      summary: "List search indexes for backend administration.",
      resource: "search.indexes",
      permission: "search.indexes.read",
      auditEvent: "search.index.list",
      requestSchema: null,
      responseSchema: "SearchIndexListResponse",
      sourceRouteCrate: "sdkwork-routes-search-backend-api",
      parameters: pageQueryParameters(),
      idempotent: true,
    },
    {
      method: "POST",
      path: "/backend/v3/api/search/indexes",
      operationId: "search.indexes.create",
      summary: "Create a search index.",
      resource: "search.indexes",
      permission: "search.indexes.write",
      auditEvent: "search.index.create",
      requestSchema: "SearchIndexCreateRequest",
      responseSchema: "SearchIndexResponse",
      sourceRouteCrate: "sdkwork-routes-search-backend-api",
      parameters: [idempotencyKeyParameter()],
      idempotent: true,
    },
    {
      method: "PATCH",
      path: "/backend/v3/api/search/indexes/{indexId}",
      operationId: "search.indexes.update",
      summary: "Update a search index.",
      resource: "search.indexes",
      permission: "search.indexes.write",
      auditEvent: "search.index.update",
      requestSchema: "SearchIndexUpdateRequest",
      responseSchema: "SearchIndexResponse",
      sourceRouteCrate: "sdkwork-routes-search-backend-api",
      parameters: [pathParameter("indexId")],
      idempotent: true,
    },
    {
      method: "DELETE",
      path: "/backend/v3/api/search/indexes/{indexId}",
      operationId: "search.indexes.delete",
      summary: "Delete a search index.",
      resource: "search.indexes",
      permission: "search.indexes.write",
      auditEvent: "search.index.delete",
      requestSchema: null,
      responseSchema: "SearchIndexDeleteResponse",
      sourceRouteCrate: "sdkwork-routes-search-backend-api",
      parameters: [pathParameter("indexId")],
      idempotent: true,
    },
    {
      method: "PUT",
      path: "/backend/v3/api/search/indexes/{indexId}/documents/{documentId}",
      operationId: "search.documents.upsert",
      summary: "Upsert a document into a search index.",
      resource: "search.documents",
      permission: "search.documents.write",
      auditEvent: "search.document.upsert",
      requestSchema: "SearchDocumentUpsertRequest",
      responseSchema: "SearchDocumentResponse",
      sourceRouteCrate: "sdkwork-routes-search-backend-api",
      parameters: [pathParameter("indexId"), pathParameter("documentId")],
      idempotent: true,
    },
    {
      method: "POST",
      path: "/backend/v3/api/search/indexes/{indexId}/documents/bulk_upsert",
      operationId: "search.documents.bulkUpsert",
      summary: "Bulk upsert documents into a search index.",
      resource: "search.documents",
      permission: "search.documents.write",
      auditEvent: "search.document.bulk_upsert",
      requestSchema: "SearchDocumentBulkUpsertRequest",
      responseSchema: "SearchDocumentBulkUpsertResponse",
      sourceRouteCrate: "sdkwork-routes-search-backend-api",
      parameters: [pathParameter("indexId"), idempotencyKeyParameter()],
      idempotent: true,
    },
    {
      method: "DELETE",
      path: "/backend/v3/api/search/indexes/{indexId}/documents/{documentId}",
      operationId: "search.documents.delete",
      summary: "Delete a document from a search index.",
      resource: "search.documents",
      permission: "search.documents.write",
      auditEvent: "search.document.delete",
      requestSchema: null,
      responseSchema: "SearchDocumentDeleteResponse",
      sourceRouteCrate: "sdkwork-routes-search-backend-api",
      parameters: [pathParameter("indexId"), pathParameter("documentId")],
      idempotent: true,
    },
    {
      method: "GET",
      path: "/backend/v3/api/search/synonyms",
      operationId: "search.synonyms.list",
      summary: "List search synonyms for backend administration.",
      resource: "search.synonyms",
      permission: "search.synonyms.read",
      auditEvent: "search.synonym.list",
      requestSchema: null,
      responseSchema: "SearchSynonymListResponse",
      sourceRouteCrate: "sdkwork-routes-search-backend-api",
      parameters: pageQueryParameters(),
      idempotent: true,
    },
    {
      method: "POST",
      path: "/backend/v3/api/search/synonyms",
      operationId: "search.synonyms.create",
      summary: "Create a search synonym.",
      resource: "search.synonyms",
      permission: "search.synonyms.write",
      auditEvent: "search.synonym.create",
      requestSchema: "SearchSynonymCreateRequest",
      responseSchema: "SearchSynonymResponse",
      sourceRouteCrate: "sdkwork-routes-search-backend-api",
      parameters: [idempotencyKeyParameter()],
      idempotent: true,
    },
    {
      method: "DELETE",
      path: "/backend/v3/api/search/synonyms/{synonymId}",
      operationId: "search.synonyms.delete",
      summary: "Delete a search synonym.",
      resource: "search.synonyms",
      permission: "search.synonyms.write",
      auditEvent: "search.synonym.delete",
      requestSchema: null,
      responseSchema: "SearchSynonymDeleteResponse",
      sourceRouteCrate: "sdkwork-routes-search-backend-api",
      parameters: [pathParameter("synonymId")],
      idempotent: true,
    },
    {
      method: "GET",
      path: "/backend/v3/api/search/ranking_profiles",
      operationId: "search.rankingProfiles.list",
      summary: "List search ranking profiles.",
      resource: "search.rankingProfiles",
      permission: "search.ranking_profiles.read",
      auditEvent: "search.ranking_profile.list",
      requestSchema: null,
      responseSchema: "SearchRankingProfileListResponse",
      sourceRouteCrate: "sdkwork-routes-search-backend-api",
      parameters: pageQueryParameters(),
      idempotent: true,
    },
    {
      method: "POST",
      path: "/backend/v3/api/search/ranking_profiles",
      operationId: "search.rankingProfiles.create",
      summary: "Create a search ranking profile.",
      resource: "search.rankingProfiles",
      permission: "search.ranking_profiles.write",
      auditEvent: "search.ranking_profile.create",
      requestSchema: "SearchRankingProfileCreateRequest",
      responseSchema: "SearchRankingProfileResponse",
      sourceRouteCrate: "sdkwork-routes-search-backend-api",
      parameters: [idempotencyKeyParameter()],
      idempotent: true,
    },
    {
      method: "PATCH",
      path: "/backend/v3/api/search/ranking_profiles/{profileId}",
      operationId: "search.rankingProfiles.update",
      summary: "Update a search ranking profile.",
      resource: "search.rankingProfiles",
      permission: "search.ranking_profiles.write",
      auditEvent: "search.ranking_profile.update",
      requestSchema: "SearchRankingProfileUpdateRequest",
      responseSchema: "SearchRankingProfileResponse",
      sourceRouteCrate: "sdkwork-routes-search-backend-api",
      parameters: [pathParameter("profileId")],
      idempotent: true,
    },
    {
      method: "GET",
      path: "/backend/v3/api/search/recommendation_strategies",
      operationId: "search.recommendationStrategies.list",
      summary: "List search recommendation strategies.",
      resource: "search.recommendationStrategies",
      permission: "search.recommendation_strategies.read",
      auditEvent: "search.recommendation_strategy.list",
      requestSchema: null,
      responseSchema: "SearchRecommendationStrategyListResponse",
      sourceRouteCrate: "sdkwork-routes-search-backend-api",
      parameters: pageQueryParameters(),
      idempotent: true,
    },
    {
      method: "POST",
      path: "/backend/v3/api/search/recommendation_strategies",
      operationId: "search.recommendationStrategies.create",
      summary: "Create a search recommendation strategy.",
      resource: "search.recommendationStrategies",
      permission: "search.recommendation_strategies.write",
      auditEvent: "search.recommendation_strategy.create",
      requestSchema: "SearchRecommendationStrategyCreateRequest",
      responseSchema: "SearchRecommendationStrategyResponse",
      sourceRouteCrate: "sdkwork-routes-search-backend-api",
      parameters: [idempotencyKeyParameter()],
      idempotent: true,
    },
    {
      method: "PATCH",
      path: "/backend/v3/api/search/recommendation_strategies/{strategyId}",
      operationId: "search.recommendationStrategies.update",
      summary: "Update a search recommendation strategy.",
      resource: "search.recommendationStrategies",
      permission: "search.recommendation_strategies.write",
      auditEvent: "search.recommendation_strategy.update",
      requestSchema: "SearchRecommendationStrategyUpdateRequest",
      responseSchema: "SearchRecommendationStrategyResponse",
      sourceRouteCrate: "sdkwork-routes-search-backend-api",
      parameters: [pathParameter("strategyId")],
      idempotent: true,
    },
    {
      method: "GET",
      path: "/backend/v3/api/search/promotions",
      operationId: "search.promotions.list",
      summary: "List search promotions.",
      resource: "search.promotions",
      permission: "search.promotions.read",
      auditEvent: "search.promotion.list",
      requestSchema: null,
      responseSchema: "SearchPromotionListResponse",
      sourceRouteCrate: "sdkwork-routes-search-backend-api",
      parameters: pageQueryParameters(),
      idempotent: true,
    },
    {
      method: "POST",
      path: "/backend/v3/api/search/promotions",
      operationId: "search.promotions.create",
      summary: "Create a search promotion.",
      resource: "search.promotions",
      permission: "search.promotions.write",
      auditEvent: "search.promotion.create",
      requestSchema: "SearchPromotionCreateRequest",
      responseSchema: "SearchPromotionAdminResponse",
      sourceRouteCrate: "sdkwork-routes-search-backend-api",
      parameters: [idempotencyKeyParameter()],
      idempotent: true,
    },
    {
      method: "PATCH",
      path: "/backend/v3/api/search/promotions/{promotionId}",
      operationId: "search.promotions.update",
      summary: "Update a search promotion.",
      resource: "search.promotions",
      permission: "search.promotions.write",
      auditEvent: "search.promotion.update",
      requestSchema: "SearchPromotionUpdateRequest",
      responseSchema: "SearchPromotionAdminResponse",
      sourceRouteCrate: "sdkwork-routes-search-backend-api",
      parameters: [pathParameter("promotionId")],
      idempotent: true,
    },
    {
      method: "DELETE",
      path: "/backend/v3/api/search/promotions/{promotionId}",
      operationId: "search.promotions.delete",
      summary: "Delete a search promotion.",
      resource: "search.promotions",
      permission: "search.promotions.write",
      auditEvent: "search.promotion.delete",
      requestSchema: null,
      responseSchema: "SearchPromotionDeleteResponse",
      sourceRouteCrate: "sdkwork-routes-search-backend-api",
      parameters: [pathParameter("promotionId")],
      idempotent: true,
    },
    {
      method: "GET",
      path: "/backend/v3/api/search/embedding_jobs",
      operationId: "search.embeddingJobs.list",
      summary: "List semantic embedding jobs.",
      resource: "search.embeddingJobs",
      permission: "search.embedding_jobs.read",
      auditEvent: "search.embedding_job.list",
      requestSchema: null,
      responseSchema: "SearchEmbeddingJobListResponse",
      sourceRouteCrate: "sdkwork-routes-search-backend-api",
      parameters: pageQueryParameters(),
      idempotent: true,
    },
    {
      method: "POST",
      path: "/backend/v3/api/search/embedding_jobs",
      operationId: "search.embeddingJobs.create",
      summary: "Create a semantic embedding job.",
      resource: "search.embeddingJobs",
      permission: "search.embedding_jobs.write",
      auditEvent: "search.embedding_job.create",
      requestSchema: "SearchEmbeddingJobCreateRequest",
      responseSchema: "SearchEmbeddingJobResponse",
      sourceRouteCrate: "sdkwork-routes-search-backend-api",
      parameters: [idempotencyKeyParameter()],
      idempotent: true,
    },
    {
      method: "POST",
      path: "/backend/v3/api/search/embedding_jobs/{jobId}/retry",
      operationId: "search.embeddingJobs.retry",
      summary: "Retry a semantic embedding job.",
      resource: "search.embeddingJobs",
      permission: "search.embedding_jobs.write",
      auditEvent: "search.embedding_job.retry",
      requestSchema: null,
      responseSchema: "SearchEmbeddingJobResponse",
      sourceRouteCrate: "sdkwork-routes-search-backend-api",
      parameters: [pathParameter("jobId")],
      idempotent: true,
    },
    {
      method: "GET",
      path: "/backend/v3/api/search/ab_experiments",
      operationId: "search.abExperiments.list",
      summary: "List search A/B experiments.",
      resource: "search.abExperiments",
      permission: "search.ab_experiments.read",
      auditEvent: "search.ab_experiment.list",
      requestSchema: null,
      responseSchema: "SearchAbExperimentListResponse",
      sourceRouteCrate: "sdkwork-routes-search-backend-api",
      parameters: pageQueryParameters(),
      idempotent: true,
    },
    {
      method: "POST",
      path: "/backend/v3/api/search/ab_experiments",
      operationId: "search.abExperiments.create",
      summary: "Create a search A/B experiment.",
      resource: "search.abExperiments",
      permission: "search.ab_experiments.write",
      auditEvent: "search.ab_experiment.create",
      requestSchema: "SearchAbExperimentCreateRequest",
      responseSchema: "SearchAbExperimentResponse",
      sourceRouteCrate: "sdkwork-routes-search-backend-api",
      parameters: [idempotencyKeyParameter()],
      idempotent: true,
    },
    {
      method: "PATCH",
      path: "/backend/v3/api/search/ab_experiments/{experimentId}",
      operationId: "search.abExperiments.update",
      summary: "Update a search A/B experiment.",
      resource: "search.abExperiments",
      permission: "search.ab_experiments.write",
      auditEvent: "search.ab_experiment.update",
      requestSchema: "SearchAbExperimentUpdateRequest",
      responseSchema: "SearchAbExperimentResponse",
      sourceRouteCrate: "sdkwork-routes-search-backend-api",
      parameters: [pathParameter("experimentId")],
      idempotent: true,
    },
    {
      method: "POST",
      path: "/backend/v3/api/search/ab_experiments/{experimentId}/assignments",
      operationId: "search.abExperiments.assign",
      summary: "Assign a subject to a search A/B experiment variant.",
      resource: "search.abExperiments",
      permission: "search.ab_experiments.write",
      auditEvent: "search.ab_experiment.assign",
      requestSchema: "SearchAbAssignmentRequest",
      responseSchema: "SearchAbAssignmentResponse",
      sourceRouteCrate: "sdkwork-routes-search-backend-api",
      parameters: [pathParameter("experimentId"), idempotencyKeyParameter()],
      idempotent: true,
    },
    {
      method: "POST",
      path: "/backend/v3/api/search/jobs/rebuild",
      operationId: "search.jobs.rebuild.create",
      summary: "Create a search index rebuild job.",
      resource: "search.jobs",
      permission: "search.jobs.write",
      auditEvent: "search.job.rebuild.create",
      requestSchema: "SearchRebuildJobRequest",
      responseSchema: "SearchIndexJobResponse",
      sourceRouteCrate: "sdkwork-routes-search-backend-api",
      parameters: [idempotencyKeyParameter()],
      idempotent: true,
    },
    {
      method: "GET",
      path: "/backend/v3/api/search/analytics/overview",
      operationId: "search.analytics.overview.retrieve",
      summary: "Retrieve search analytics overview.",
      resource: "search.analytics",
      permission: "search.analytics.read",
      auditEvent: "search.analytics.overview.retrieve",
      requestSchema: null,
      responseSchema: "SearchAnalyticsOverview",
      sourceRouteCrate: "sdkwork-routes-search-backend-api",
      parameters: [],
      idempotent: true,
    },
    {
      method: "GET",
      path: "/backend/v3/api/search/providers",
      operationId: "search.providers.list",
      summary: "List configured search providers.",
      resource: "search.providers",
      permission: "search.providers.read",
      auditEvent: "search.provider.list",
      requestSchema: null,
      responseSchema: "SearchProviderListResponse",
      sourceRouteCrate: "sdkwork-routes-search-backend-api",
      parameters: pageQueryParameters(),
      idempotent: true,
    },
    {
      method: "POST",
      path: "/backend/v3/api/search/providers",
      operationId: "search.providers.create",
      summary: "Create a search provider configuration.",
      resource: "search.providers",
      permission: "search.providers.write",
      auditEvent: "search.provider.create",
      requestSchema: "SearchProviderCreateRequest",
      responseSchema: "SearchProviderResponse",
      sourceRouteCrate: "sdkwork-routes-search-backend-api",
      parameters: [idempotencyKeyParameter()],
      idempotent: true,
    },
    {
      method: "PATCH",
      path: "/backend/v3/api/search/providers/{providerId}",
      operationId: "search.providers.update",
      summary: "Update a search provider configuration.",
      resource: "search.providers",
      permission: "search.providers.write",
      auditEvent: "search.provider.update",
      requestSchema: "SearchProviderUpdateRequest",
      responseSchema: "SearchProviderResponse",
      sourceRouteCrate: "sdkwork-routes-search-backend-api",
      parameters: [pathParameter("providerId")],
      idempotent: true,
    },
    {
      method: "POST",
      path: "/backend/v3/api/search/providers/{providerId}/health_checks",
      operationId: "search.providers.healthChecks.create",
      summary: "Run a search provider health check.",
      resource: "search.providers.healthChecks",
      permission: "search.providers.write",
      auditEvent: "search.provider.health_check.create",
      requestSchema: null,
      responseSchema: "SearchProviderHealthCheckResponse",
      sourceRouteCrate: "sdkwork-routes-search-backend-api",
      parameters: [pathParameter("providerId")],
      idempotent: true,
    },
  ];

  const families = [
    {
      family: "sdkwork-search-app-sdk",
      title: "SDKWork Search App API",
      description: "App/client contract for sdkwork-search query and index discovery APIs.",
      apiAuthority: "sdkwork-search-app-api",
      prefix: "/app/v3/api",
      sdkType: "app",
      requestContext: "AppRequestContext",
      packageName: LANGUAGE_MATRIX.typescript.appPackage,
      routes: appRoutes,
      manifestPackageName: "sdkwork-routes-search-app-api",
      manifestSurface: "app-api",
    },
    {
      family: "sdkwork-search-backend-sdk",
      title: "SDKWork Search Backend API",
      description: "Backend/admin contract for sdkwork-search index and document management APIs.",
      apiAuthority: "sdkwork-search-backend-api",
      prefix: "/backend/v3/api",
      sdkType: "backend",
      requestContext: "BackendRequestContext",
      packageName: LANGUAGE_MATRIX.typescript.backendPackage,
      routes: backendRoutes,
      manifestPackageName: "sdkwork-routes-search-backend-api",
      manifestSurface: "backend-api",
    },
  ];

  for (const family of families) {
    const normalizedRoutes = family.routes.map((route) =>
      manifestRoute({
        method: route.method,
        routePath: route.path,
        operationId: route.operationId,
        requestSchema: route.requestSchema,
        responseSchema: route.responseSchema,
        apiAuthority: family.apiAuthority,
        sourceRouteCrate: route.sourceRouteCrate,
        permission: route.permission,
        auditEvent: route.auditEvent,
        requestContext: family.requestContext,
      }),
    );
    const routeManifest = {
      schemaVersion: 1,
      kind: "sdkwork.route.manifest",
      packageName: family.manifestPackageName,
      surface: family.manifestSurface,
      owner: OWNER,
      domain: DOMAIN,
      capability: DOMAIN,
      apiAuthority: family.apiAuthority,
      sdkFamily: family.family,
      prefix: family.prefix,
      source: {
        crateRoot: `packages/native-rust/routes/${family.manifestSurface}/${family.manifestPackageName}`,
        crateImport: family.manifestPackageName.replaceAll("-", "_"),
      },
      routes: normalizedRoutes,
    };

    await writeJson(
      path.join(
        ROOT,
        "sdks",
        "_route-manifests",
        family.manifestSurface,
        `${family.manifestPackageName}.route-manifest.json`,
      ),
      routeManifest,
    );

    const openApi = buildOpenApi({
      ...family,
      sdkFamily: family.family,
    });
    const derivedOpenApi = {
      ...openApi,
      "x-sdkwork-derived-from": `openapi/${family.apiAuthority}.openapi.yaml`,
    };
    const familyRoot = path.join(ROOT, "sdks", family.family);
    await writeJson(path.join(familyRoot, "openapi", `${family.apiAuthority}.openapi.yaml`), openApi);
    await writeJson(path.join(familyRoot, "openapi", `${family.apiAuthority}.sdkgen.yaml`), derivedOpenApi);
    await writeJson(
      path.join(familyRoot, ".sdkwork-assembly.json"),
      buildAssembly(family),
    );
    await writeJson(
      path.join(familyRoot, "specs", "component.spec.json"),
      buildComponentSpec(family),
    );
  }

  const materialized = families
    .map((family) => `${family.family}: ${family.routes.length} routes`)
    .join(", ");
  console.log(`Materialized sdkwork-search OpenAPI boundaries: ${materialized}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
