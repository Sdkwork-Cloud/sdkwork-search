import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const APPBASE_ROOT =
  "D:\\javasource\\spring-ai-plus\\spring-ai-plus-business\\apps\\sdkwork-appbase";
const GENERATOR_PATH =
  "D:\\javasource\\spring-ai-plus\\sdk\\sdkwork-sdk-generator\\bin\\sdkgen.js";

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
  assertEqual(component.generator.entrypoint, GENERATOR_PATH, `${family} canonical generator`);
  assertEqual(component.generator.standardProfile, "sdkwork-v3", `${family} standard profile`);
  assertArray(component.contracts.sdkDependencies, `${family} component sdkDependencies`);
  if ((component.contracts.sdkDependencies ?? []).length !== (assembly.sdkDependencies ?? []).length) {
    fail(`${family} component and assembly sdkDependencies differ`);
  }

  assertEqual(openApi.openapi, "3.1.2", `${authority} OpenAPI version`);
  assertEqual(openApi.info?.["x-sdkwork-api-authority"], authority, `${authority} info authority`);
  assertEqual(openApi.info?.["x-sdkwork-sdk-family"], family, `${authority} info family`);
  assertEqual(sdkgen["x-sdkwork-derived-from"], `openapi/${authority}.openapi.yaml`, `${authority} sdkgen source`);
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
}

function checkRouteCrates() {
  const crates = [
    {
      path: "packages/native-rust/routes/app-api/sdkwork-routes-search-app-api",
      name: "sdkwork-routes-search-app-api",
    },
    {
      path: "packages/native-rust/routes/backend-api/sdkwork-routes-search-backend-api",
      name: "sdkwork-routes-search-backend-api",
    },
    {
      path: "packages/native-rust/search/sdkwork-search-storage-sqlx-rust",
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
  const packageJsonFiles = walkFiles(path.join(ROOT, "packages"))
    .filter((file) => path.basename(file) === "package.json");
  const expectedPackages = new Set([
    "@sdkwork/search-contracts",
    "@sdkwork/search-service",
    "@sdkwork/search-pc-react",
    "@sdkwork/search-mobile-react",
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
  expectedOperations: [
    { method: "POST", path: "/app/v3/api/search/queries" },
    { method: "GET", path: "/app/v3/api/search/indexes" },
  ],
});

checkFamily({
  family: "sdkwork-search-backend-sdk",
  authority: "sdkwork-search-backend-api",
  prefix: "/backend/v3/api",
  sdkType: "backend",
  routeManifest: "sdkwork-routes-search-backend-api.route-manifest.json",
  expectedOperations: [
    { method: "GET", path: "/backend/v3/api/search/indexes" },
    { method: "POST", path: "/backend/v3/api/search/indexes" },
    { method: "PUT", path: "/backend/v3/api/search/indexes/{indexId}/documents/{documentId}" },
    { method: "DELETE", path: "/backend/v3/api/search/indexes/{indexId}/documents/{documentId}" },
  ],
});
checkRouteCrates();
checkCurrentRepoOwnership();
checkAppbaseResiduals();

if (failures.length > 0) {
  console.error("sdkwork-search governance failures:");
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log("sdkwork-search governance checks passed.");
