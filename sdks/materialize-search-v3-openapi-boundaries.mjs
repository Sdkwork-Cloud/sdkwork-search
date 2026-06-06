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
    SearchDocumentUpsertRequest: {
      type: "object",
      additionalProperties: false,
      required: ["document"],
      properties: {
        document: { $ref: "#/components/schemas/SearchDocument" },
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
  };
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
      schemas: schemas(),
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
