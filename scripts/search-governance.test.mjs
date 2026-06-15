import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const APPBASE_ROOT = path.resolve(ROOT, "..", "sdkwork-appbase");
const GENERATOR_PATH = path.resolve(ROOT, "../sdkwork-sdk-generator/bin/sdkgen.js");

const failures = [];

function fail(message) {
  failures.push(message);
}

function readJson(relativePath) {
  const fullPath = path.join(ROOT, relativePath);
  try {
    return JSON.parse(readFileSync(fullPath, "utf8"));
  } catch (error) {
    fail(`Invalid or missing JSON-compatible file ${relativePath}: ${error.message}`);
    return null;
  }
}

function walkFiles(root) {
  if (!existsSync(root)) {
    return [];
  }

  const files = [];
  const stack = [root];
  while (stack.length > 0) {
    const current = stack.pop();
    const entries = readdirSync(current, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(current, entry.name);
      if (entry.isDirectory()) {
        if (entry.name === "node_modules" || entry.name === "target" || entry.name === ".git") {
          continue;
        }
        stack.push(fullPath);
      } else {
        files.push(fullPath);
      }
    }
  }

  return files;
}

function assertFile(relativePath) {
  if (!existsSync(path.join(ROOT, relativePath))) {
    fail(`Missing required file: ${relativePath}`);
  }
}

function assertEqual(actual, expected, label) {
  if (actual !== expected) {
    fail(`${label}: expected ${expected}, got ${actual}`);
  }
}

function assertArray(actual, label) {
  if (!Array.isArray(actual)) {
    fail(`${label}: expected array`);
  }
}

function operations(openApi) {
  const result = [];
  for (const [routePath, pathItem] of Object.entries(openApi.paths ?? {})) {
    for (const method of ["get", "post", "put", "patch", "delete"]) {
      if (pathItem?.[method]) {
        result.push({ path: routePath, method, operation: pathItem[method] });
      }
    }
  }
  return result;
}

function checkFamily({
  family,
  authority,
  prefix,
  sdkType,
  expectedOperations,
  routeManifest,
  forbiddenSchemas = [],
  forbiddenGeneratedPatterns = [],
}) {
  assertFile(`sdks/${family}/README.md`);
  assertFile(`sdks/${family}/.sdkwork-assembly.json`);
  assertFile(`sdks/${family}/specs/component.spec.json`);
  assertFile(`sdks/${family}/openapi/${authority}.openapi.yaml`);
  assertFile(`sdks/${family}/openapi/${authority}.sdkgen.yaml`);
  assertFile(`sdks/${family}/bin/generate-sdk.ps1`);
  assertFile(`sdks/_route-manifests/${sdkType === "app" ? "app-api" : "backend-api"}/${routeManifest}`);

  const assembly = readJson(`sdks/${family}/.sdkwork-assembly.json`);
  const component = readJson(`sdks/${family}/specs/component.spec.json`);
  const openApi = readJson(`sdks/${family}/openapi/${authority}.openapi.yaml`);
  const sdkgen = readJson(`sdks/${family}/openapi/${authority}.sdkgen.yaml`);
  const manifest = readJson(`sdks/_route-manifests/${sdkType === "app" ? "app-api" : "backend-api"}/${routeManifest}`);

  if (!assembly || !component || !openApi || !sdkgen || !manifest) {
    return;
  }

  assertEqual(assembly.workspace, family, `${family} assembly workspace`);
  assertEqual(assembly.sdkOwner, "sdkwork-search", `${family} sdk owner`);
  assertEqual(assembly.apiAuthority, authority, `${family} api authority`);
  assertEqual(assembly.generationInputSpec, `openapi/${authority}.sdkgen.yaml`, `${family} generation input`);
  assertArray(assembly.sdkDependencies, `${family} assembly sdkDependencies`);
  assertEqual(assembly.discoverySurface.apiPrefix, prefix, `${family} api prefix`);

  assertEqual(component.name, family, `${family} component name`);
  assertEqual(component.domain, "search", `${family} component domain`);
  assertEqual(component.apiAuthority, authority, `${family} component authority`);
  assertEqual(component.apiPrefix, prefix, `${family} component prefix`);
  assertEqual(component.sdkType, sdkType, `${family} component sdk type`);
  const sdkFamilyDir = path.join(ROOT, "sdks", family);
  const resolvedEntrypoint = path.resolve(sdkFamilyDir, component.generator.entrypoint);
  assertEqual(resolvedEntrypoint, GENERATOR_PATH, `${family} canonical generator`);
  assertEqual(component.generator.standardProfile, "sdkwork-v3", `${family} standard profile`);
  assertArray(component.contracts.sdkDependencies, `${family} component sdkDependencies`);
  if ((component.contracts.sdkDependencies ?? []).length !== (assembly.sdkDependencies ?? []).length) {
    fail(`${family} component and assembly sdkDependencies differ`);
  }

  assertEqual(openApi.openapi, "3.1.2", `${authority} OpenAPI version`);
  assertEqual(openApi.info?.["x-sdkwork-api-authority"], authority, `${authority} info authority`);
  assertEqual(openApi.info?.["x-sdkwork-sdk-family"], family, `${authority} info family`);
  assertEqual(sdkgen["x-sdkwork-derived-from"], `openapi/${authority}.openapi.yaml`, `${authority} sdkgen source`);
  for (const schemaName of forbiddenSchemas) {
    if (openApi.components?.schemas?.[schemaName]) {
      fail(`${authority} must not include unreferenced or foreign-surface schema ${schemaName}`);
    }
    if (sdkgen.components?.schemas?.[schemaName]) {
      fail(`${authority} sdkgen input must not include unreferenced or foreign-surface schema ${schemaName}`);
    }
  }
  assertEqual(manifest.kind, "sdkwork.route.manifest", `${family} route manifest kind`);
  assertEqual(manifest.owner, "sdkwork-search", `${family} route owner`);
  assertEqual(manifest.domain, "search", `${family} route domain`);
  assertEqual(manifest.apiAuthority, authority, `${family} route authority`);
  assertEqual(manifest.sdkFamily, family, `${family} route sdk family`);
  assertEqual(manifest.prefix, prefix, `${family} route prefix`);

  const ops = operations(openApi);
  if (ops.length !== expectedOperations.length) {
    fail(`${authority} operation count: expected ${expectedOperations.length}, got ${ops.length}`);
  }

  const expectedKeys = new Set(expectedOperations.map((op) => `${op.method.toLowerCase()} ${op.path}`));
  const actualKeys = new Set(ops.map((op) => `${op.method} ${op.path}`));
  for (const key of expectedKeys) {
    if (!actualKeys.has(key)) {
      fail(`${authority} missing operation ${key}`);
    }
  }

  for (const { path: routePath, method, operation } of ops) {
    if (!routePath.startsWith(prefix)) {
      fail(`${authority} ${method.toUpperCase()} ${routePath} does not use prefix ${prefix}`);
    }
    assertEqual(operation["x-sdkwork-owner"], "sdkwork-search", `${authority} ${operation.operationId} owner`);
    assertEqual(operation["x-sdkwork-api-authority"], authority, `${authority} ${operation.operationId} authority`);
    assertEqual(operation["x-sdkwork-domain"], "search", `${authority} ${operation.operationId} domain`);
    if (!operation["x-sdkwork-resource"]) {
      fail(`${authority} ${operation.operationId} missing x-sdkwork-resource`);
    }
    if (!operation["x-sdkwork-permission"]) {
      fail(`${authority} ${operation.operationId} missing x-sdkwork-permission`);
    }
    if (!operation["x-sdkwork-audit-event"]) {
      fail(`${authority} ${operation.operationId} missing x-sdkwork-audit-event`);
    }
    if (!operation["x-sdkwork-source-route-crate"]?.startsWith("sdkwork-routes-search-")) {
      fail(`${authority} ${operation.operationId} missing source route crate`);
    }
    const security = JSON.stringify(operation.security ?? []);
    if (!security.includes("AuthToken") || !security.includes("AccessToken")) {
      fail(`${authority} ${operation.operationId} must require AuthToken and AccessToken`);
    }
    for (const parameter of operation.parameters ?? []) {
      if (["keyword", "search", "searchQuery", "search_query"].includes(parameter.name)) {
        fail(`${authority} ${operation.operationId} uses forbidden generic search parameter ${parameter.name}`);
      }
    }
  }

  const generatedSourceRoot = path.join(
    ROOT,
    "sdks",
    family,
    `${family}-typescript`,
    "generated",
    "server-openapi",
    "src",
  );
  for (const file of walkFiles(generatedSourceRoot).filter((entry) => /\.(ts|tsx)$/.test(entry))) {
    const content = readFileSync(file, "utf8");
    for (const pattern of forbiddenGeneratedPatterns) {
      if (pattern.test(content)) {
        fail(`${family} generated output contains foreign-surface API/type in ${file}: ${pattern}`);
      }
    }
  }
}

function checkRouteCrates() {
  const crates = [
    {
      path: "crates/sdkwork-routes-search-app-api",
      name: "sdkwork-routes-search-app-api",
    },
    {
      path: "crates/sdkwork-routes-search-backend-api",
      name: "sdkwork-routes-search-backend-api",
    },
    {
      path: "crates/sdkwork-search-storage-sqlx-rust",
      name: "sdkwork_search_storage_sqlx",
    },
  ];

  for (const crate of crates) {
    const cargoPath = path.join(ROOT, crate.path, "Cargo.toml");
    if (!existsSync(cargoPath)) {
      fail(`Missing Cargo.toml for ${crate.path}`);
      continue;
    }
    const content = readFileSync(cargoPath, "utf8");
    if (!content.includes(`name = "${crate.name}"`)) {
      fail(`${crate.path} Cargo.toml does not declare ${crate.name}`);
    }
  }
}

function checkCurrentRepoOwnership() {
  const packageJsonFiles = [
    ...walkFiles(path.join(ROOT, "packages")),
    ...walkFiles(path.join(ROOT, "apps")),
  ].filter((file) => path.basename(file) === "package.json");
  const expectedPackages = new Set([
    "@sdkwork/search-contracts",
    "@sdkwork/search-service",
    "@sdkwork/search-pc-react",
    "@sdkwork/search-h5-react",
  ]);
  const found = new Set();

  for (const file of packageJsonFiles) {
    const pkg = JSON.parse(readFileSync(file, "utf8"));
    found.add(pkg.name);
    if (pkg.sdkwork?.workspace && pkg.sdkwork.workspace !== "sdkwork-search") {
      fail(`${path.relative(ROOT, file)} has non-search sdkwork workspace ${pkg.sdkwork.workspace}`);
    }
  }

  for (const name of expectedPackages) {
    if (!found.has(name)) {
      fail(`Missing search package ${name}`);
    }
  }
}

function checkSearchProviderSolutionArchitecture() {
  const servicePath = path.join(
    ROOT,
    "packages/common/search/sdkwork-search-service/src/searchService.ts",
  );
  const contractsPath = path.join(
    ROOT,
    "packages/common/search/sdkwork-search-contracts/src/search.ts",
  );
  const service = readFileSync(servicePath, "utf8");
  const contracts = readFileSync(contractsPath, "utf8");

  for (const expected of [
    "createAlgoliaProvider",
    "createElasticsearchProvider",
    "createPostgresqlSearchProvider",
    "createMemorySearchProvider",
    "createExternalSearchProvider",
    "createMeilisearchProvider",
    "createOpenSearchProvider",
    "createSdkworkSearchSolutionSet",
    "createTypesenseProvider",
    "createVectorSearchProvider",
  ]) {
    if (!service.includes(`export function ${expected}`)) {
      fail(`search service must expose provider solution factory ${expected}`);
    }
  }

  if (!service.includes("SDKWORK_POSTGRESQL_SEARCH_PROVIDER_MANIFEST")) {
    fail("search service must anchor the default PostgreSQL solution to the canonical manifest");
  }

  if (!service.includes("SdkworkPostgresqlSearchRepository")) {
    fail("search service must expose a PostgreSQL repository adapter port for real database execution");
  }

  if (!service.includes("assertExternalProviderImplementsCapabilities")) {
    fail("search service must validate external provider capability declarations against adapters");
  }

  if (!service.includes('document_indexing: "upsertDocument"')) {
    fail("search service must route document_indexing capabilities through provider upsertDocument adapters");
  }

  if (!service.includes("recommendationStrategies?: readonly SdkworkRecommendationStrategyInput[]")) {
    fail("search service must expose recommendation strategy injection points for extensible recommendation solutions");
  }

  if (!service.includes("strategies: recommendationStrategies")) {
    fail("search service must pass recommendation strategy definitions into local PostgreSQL/memory recommendation execution");
  }

  if (!service.includes("syncIndex(") || !service.includes("createSdkworkSearchIndexSyncPlan")) {
    fail("search service must expose an index synchronization pipeline backed by shared sync plans");
  }

  if (!contracts.includes("export const SDKWORK_POSTGRESQL_SEARCH_PROVIDER_MANIFEST")) {
    fail("search contracts must export the canonical PostgreSQL provider manifest");
  }

  if (!contracts.includes('"postgresql"') || !contracts.includes('"pg_trgm"')) {
    fail("search contracts must keep PostgreSQL/pg_trgm as the default search module declaration");
  }

  for (const expected of [
    "SDKWORK_POSTGRESQL_RECOMMENDATION_STRATEGY",
    "SDKWORK_POSTGRESQL_RECOMMENDATION_STRATEGIES",
    "createSdkworkRecommendationStrategyRegistry",
    "selectSdkworkRecommendationStrategy",
    "normalizeSdkworkRecommendationStrategyDefinition",
  ]) {
    if (!contracts.includes(`export function ${expected}`) && !contracts.includes(`export const ${expected}`)) {
      fail(`search contracts must expose recommendation strategy architecture ${expected}`);
    }
  }

  for (const expectedType of ["collaborative", "content", "hybrid", "popular", "semantic"]) {
    if (!contracts.includes(`"${expectedType}"`)) {
      fail(`search contracts must support recommendation strategy type ${expectedType}`);
    }
  }

  if (!contracts.includes('strategyId: "postgresql-hybrid"')) {
    fail("search contracts must make PostgreSQL hybrid the default recommendation strategy");
  }

  if (!contracts.includes('"popular_signal"') || !contracts.includes('"semantic_signal"') || !contracts.includes('"collaborative_signal"')) {
    fail("search contracts must emit explainable recommendation strategy signals");
  }

  for (const expected of [
    "SdkworkSearchIndexDefinition",
    "normalizeSdkworkSearchIndexDefinition",
    "mapSdkworkSearchIndexSourceItems",
    "createSdkworkSearchIndexSyncPlan",
    "SdkworkSearchIndexSyncResponse",
  ]) {
    if (!contracts.includes(expected)) {
      fail(`search contracts must expose search index synchronization architecture ${expected}`);
    }
  }
}

function checkRecommendationStrategyGovernance() {
  const backendOpenApi = readJson(
    "sdks/sdkwork-search-backend-sdk/openapi/sdkwork-search-backend-api.openapi.yaml",
  );
  const backendSdkgen = readJson(
    "sdks/sdkwork-search-backend-sdk/openapi/sdkwork-search-backend-api.sdkgen.yaml",
  );
  if (!backendOpenApi || !backendSdkgen) {
    return;
  }

  for (const [label, openApi] of [
    ["backend OpenAPI", backendOpenApi],
    ["backend SDK input", backendSdkgen],
  ]) {
    const enumValues = openApi.components?.schemas?.SearchRecommendationStrategy?.properties?.strategyType?.enum;
    for (const expectedType of ["collaborative", "content", "hybrid", "popular", "semantic"]) {
      if (!enumValues?.includes(expectedType)) {
        fail(`${label} SearchRecommendationStrategy must include strategy type ${expectedType}`);
      }
    }
  }

  const contractsTest = readFileSync(
    path.join(
      ROOT,
      "packages/common/search/sdkwork-search-contracts/tests/searchContracts.test.ts",
    ),
    "utf8",
  );
  const serviceTest = readFileSync(
    path.join(
      ROOT,
      "packages/common/search/sdkwork-search-service/tests/searchService.test.ts",
    ),
    "utf8",
  );

  if (!contractsTest.includes("declares PostgreSQL hybrid as the default recommendation strategy")) {
    fail("search contracts tests must lock PostgreSQL hybrid as the default recommendation strategy");
  }
  if (!serviceTest.includes("keeps PostgreSQL as the default recommendation engine")) {
    fail("search service tests must keep PostgreSQL default when external recommendation providers exist");
  }
}

function checkProviderSecretBoundary() {
  const backendOpenApi = readJson(
    "sdks/sdkwork-search-backend-sdk/openapi/sdkwork-search-backend-api.openapi.yaml",
  );
  const backendSdkgen = readJson(
    "sdks/sdkwork-search-backend-sdk/openapi/sdkwork-search-backend-api.sdkgen.yaml",
  );
  if (!backendOpenApi || !backendSdkgen) {
    return;
  }

  for (const [label, openApi] of [
    ["backend OpenAPI", backendOpenApi],
    ["backend SDK input", backendSdkgen],
  ]) {
    const schemas = openApi.components?.schemas ?? {};
    const provider = schemas.SearchProvider;
    const createRequest = schemas.SearchProviderCreateRequest;
    const updateRequest = schemas.SearchProviderUpdateRequest;
    const providerConfig = provider?.properties?.config;

    if (!providerConfig?.description?.includes("Non-secret")) {
      fail(`${label} SearchProvider.config must document that response config is non-secret only`);
    }
    if (provider?.properties?.secretConfig) {
      fail(`${label} SearchProvider response must not expose secretConfig`);
    }
    if (provider?.properties?.apiKey || provider?.properties?.token || provider?.properties?.secret) {
      fail(`${label} SearchProvider response must not expose raw credential-shaped properties`);
    }

    for (const [schemaName, schema] of [
      ["SearchProviderCreateRequest", createRequest],
      ["SearchProviderUpdateRequest", updateRequest],
    ]) {
      const secretConfig = schema?.properties?.secretConfig;
      if (!secretConfig) {
        fail(`${label} ${schemaName} must accept secretConfig for provider credentials`);
        continue;
      }
      if (secretConfig.writeOnly !== true) {
        fail(`${label} ${schemaName}.secretConfig must be writeOnly`);
      }
      if (!secretConfig.description?.includes("write-only")) {
        fail(`${label} ${schemaName}.secretConfig must document write-only credential semantics`);
      }
    }
  }

  const generatedProviderType = path.join(
    ROOT,
    "sdks/sdkwork-search-backend-sdk/sdkwork-search-backend-sdk-typescript/generated/server-openapi/src/types/search-provider.ts",
  );
  const generatedCreateType = path.join(
    ROOT,
    "sdks/sdkwork-search-backend-sdk/sdkwork-search-backend-sdk-typescript/generated/server-openapi/src/types/search-provider-create-request.ts",
  );
  const generatedUpdateType = path.join(
    ROOT,
    "sdks/sdkwork-search-backend-sdk/sdkwork-search-backend-sdk-typescript/generated/server-openapi/src/types/search-provider-update-request.ts",
  );

  for (const file of [generatedProviderType, generatedCreateType, generatedUpdateType]) {
    if (!existsSync(file)) {
      fail(`Missing generated provider SDK type: ${file}`);
      return;
    }
  }

  const providerType = readFileSync(generatedProviderType, "utf8");
  const createType = readFileSync(generatedCreateType, "utf8");
  const updateType = readFileSync(generatedUpdateType, "utf8");

  if (/\b(secretConfig|apiKey|token|secret)\??:/.test(providerType)) {
    fail("Generated SearchProvider response type must not expose provider credential fields");
  }
  if (!createType.includes("secretConfig?: Record<string, unknown>;")) {
    fail("Generated SearchProviderCreateRequest type must expose write-only secretConfig");
  }
  if (!updateType.includes("secretConfig?: Record<string, unknown>;")) {
    fail("Generated SearchProviderUpdateRequest type must expose write-only secretConfig");
  }
}

function checkAppbaseResiduals() {
  if (!existsSync(APPBASE_ROOT)) {
    fail(`sdkwork-appbase root not found: ${APPBASE_ROOT}`);
    return;
  }

  const oldDirs = [
    path.join(APPBASE_ROOT, "packages/pc-react/foundation/sdkwork-search-pc-react"),
    path.join(APPBASE_ROOT, "packages/mobile-react/foundation/sdkwork-search-mobile-react"),
  ];

  for (const dir of oldDirs) {
    if (existsSync(dir) && statSync(dir).isDirectory()) {
      fail(`sdkwork-appbase still owns local search package directory: ${dir}`);
    }
  }

  const scannedFiles = [
    path.join(APPBASE_ROOT, "tsconfig.base.json"),
    path.join(APPBASE_ROOT, "pnpm-workspace.yaml"),
    ...walkFiles(path.join(APPBASE_ROOT, "packages")).filter((file) =>
      /\.(ts|tsx|json|md)$/.test(file) && !/\.test\.(ts|tsx)$/.test(file),
    ),
    ...walkFiles(path.join(APPBASE_ROOT, "scripts")).filter((file) =>
      /\.(mjs|js|ts|json|md)$/.test(file) &&
      path.basename(file) !== "appbase-search-extraction-boundary.test.mjs",
    ),
  ].filter((file) => existsSync(file));

  const forbiddenOwnershipPatterns = [
    /workspace["']?\s*:\s*["']sdkwork-appbase["'][\s\S]{0,160}capability["']?\s*:\s*["']search["']/,
    /sdkwork-appbase[\\/]packages[\\/](pc-react|mobile-react)[\\/]foundation[\\/]sdkwork-search/,
    /["']packages[\\/](pc-react|mobile-react)[\\/]foundation[\\/]sdkwork-search-(pc|mobile)-react/,
    /openai\.v1\.search\.query/,
    /pathPattern["']?\s*:\s*["']\/v1\/search["']/,
    /\|\s*["']search["']/,
    /capabilityFamilies:\s*\[[^\]]*["']search["']/,
    /["']vector-and-search["']/,
  ];

  for (const file of scannedFiles) {
    const content = readFileSync(file, "utf8");
    for (const pattern of forbiddenOwnershipPatterns) {
      if (pattern.test(content)) {
        fail(`sdkwork-appbase residual search ownership in ${file}: ${pattern}`);
      }
    }
  }
}

checkFamily({
  family: "sdkwork-search-app-sdk",
  authority: "sdkwork-search-app-api",
  prefix: "/app/v3/api",
  sdkType: "app",
  routeManifest: "sdkwork-routes-search-app-api.route-manifest.json",
  forbiddenSchemas: [
    "SearchAbExperiment",
    "SearchAbExperimentCreateRequest",
    "SearchEmbeddingJob",
    "SearchEmbeddingJobCreateRequest",
    "SearchIndexUpdateRequest",
    "SearchProvider",
    "SearchProviderCreateRequest",
    "SearchProviderHealthCheck",
    "SearchProviderUpdateRequest",
    "SearchRankingProfile",
    "SearchRecommendationStrategy",
    "SearchSynonym",
  ],
  forbiddenGeneratedPatterns: [
    /SearchAbExperiment/,
    /SearchEmbeddingJob/,
    /SearchProvider/,
    /SearchRankingProfile/,
    /SearchRecommendationStrategy/,
    /SearchSynonym/,
    /SearchIndexUpdateRequest/,
    /SearchIndexDeleteResponse/,
    /bulkUpsert/,
  ],
  expectedOperations: [
    { method: "POST", path: "/app/v3/api/search/queries" },
    { method: "GET", path: "/app/v3/api/search/indexes" },
    { method: "GET", path: "/app/v3/api/search/suggestions" },
    { method: "POST", path: "/app/v3/api/search/recommendations" },
    { method: "POST", path: "/app/v3/api/search/promotions" },
    { method: "POST", path: "/app/v3/api/search/events" },
    { method: "GET", path: "/app/v3/api/search/recent_queries" },
    { method: "POST", path: "/app/v3/api/search/semantic_queries" },
  ],
});

checkFamily({
  family: "sdkwork-search-backend-sdk",
  authority: "sdkwork-search-backend-api",
  prefix: "/backend/v3/api",
  sdkType: "backend",
  routeManifest: "sdkwork-routes-search-backend-api.route-manifest.json",
  forbiddenSchemas: [
    "SearchRecentQuery",
    "SearchRecentQueryListResponse",
    "SearchSemanticQueryRequest",
    "SearchSemanticQueryResponse",
    "SearchSemanticResult",
    "SearchSuggestionsResponse",
    "SearchUserEvent",
    "SearchUserEventResponse",
  ],
  forbiddenGeneratedPatterns: [
    /SearchRecentQuery/,
    /SearchSemantic/,
    /SearchSuggestions/,
    /SearchUserEvent/,
    /semanticQueries/,
    /recentQueries/,
  ],
  expectedOperations: [
    { method: "GET", path: "/backend/v3/api/search/indexes" },
    { method: "POST", path: "/backend/v3/api/search/indexes" },
    { method: "PATCH", path: "/backend/v3/api/search/indexes/{indexId}" },
    { method: "DELETE", path: "/backend/v3/api/search/indexes/{indexId}" },
    { method: "PUT", path: "/backend/v3/api/search/indexes/{indexId}/documents/{documentId}" },
    { method: "POST", path: "/backend/v3/api/search/indexes/{indexId}/documents/bulk_upsert" },
    { method: "DELETE", path: "/backend/v3/api/search/indexes/{indexId}/documents/{documentId}" },
    { method: "GET", path: "/backend/v3/api/search/synonyms" },
    { method: "POST", path: "/backend/v3/api/search/synonyms" },
    { method: "DELETE", path: "/backend/v3/api/search/synonyms/{synonymId}" },
    { method: "GET", path: "/backend/v3/api/search/ranking_profiles" },
    { method: "POST", path: "/backend/v3/api/search/ranking_profiles" },
    { method: "PATCH", path: "/backend/v3/api/search/ranking_profiles/{profileId}" },
    { method: "GET", path: "/backend/v3/api/search/recommendation_strategies" },
    { method: "POST", path: "/backend/v3/api/search/recommendation_strategies" },
    { method: "PATCH", path: "/backend/v3/api/search/recommendation_strategies/{strategyId}" },
    { method: "GET", path: "/backend/v3/api/search/promotions" },
    { method: "POST", path: "/backend/v3/api/search/promotions" },
    { method: "PATCH", path: "/backend/v3/api/search/promotions/{promotionId}" },
    { method: "DELETE", path: "/backend/v3/api/search/promotions/{promotionId}" },
    { method: "GET", path: "/backend/v3/api/search/embedding_jobs" },
    { method: "POST", path: "/backend/v3/api/search/embedding_jobs" },
    { method: "POST", path: "/backend/v3/api/search/embedding_jobs/{jobId}/retry" },
    { method: "GET", path: "/backend/v3/api/search/ab_experiments" },
    { method: "POST", path: "/backend/v3/api/search/ab_experiments" },
    { method: "PATCH", path: "/backend/v3/api/search/ab_experiments/{experimentId}" },
    { method: "POST", path: "/backend/v3/api/search/ab_experiments/{experimentId}/assignments" },
    { method: "POST", path: "/backend/v3/api/search/jobs/rebuild" },
    { method: "GET", path: "/backend/v3/api/search/analytics/overview" },
    { method: "GET", path: "/backend/v3/api/search/providers" },
    { method: "POST", path: "/backend/v3/api/search/providers" },
    { method: "PATCH", path: "/backend/v3/api/search/providers/{providerId}" },
    { method: "POST", path: "/backend/v3/api/search/providers/{providerId}/health_checks" },
  ],
});
checkRouteCrates();
checkCurrentRepoOwnership();
checkSearchProviderSolutionArchitecture();
checkRecommendationStrategyGovernance();
checkProviderSecretBoundary();
checkAppbaseResiduals();

if (failures.length > 0) {
  console.error("sdkwork-search governance failures:");
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log("sdkwork-search governance checks passed.");
