import { coalesce, defaultIfBlank, isBlank, trim } from "@sdkwork/utils";

export interface SdkworkSearchDocument {
  capability?: string;
  description?: string;
  enabled?: boolean;
  group?: string;
  groupOrder?: number;
  id: string;
  keywords?: readonly string[];
  kind?: string;
  order?: number;
  scope?: string;
  source?: string;
  title: string;
  metadata?: Record<string, unknown>;
}

export interface SdkworkSearchGroup {
  capabilityIds: string[];
  documentIds: string[];
  heading: string;
  id: string;
  order: number;
  scopeIds: string[];
}

export interface SdkworkSearchCatalog {
  capabilityIds: string[];
  documents: SdkworkSearchDocument[];
  documentsById: Record<string, SdkworkSearchDocument>;
  groups: SdkworkSearchGroup[];
  scopeIds: string[];
}

export interface SdkworkSearchResult {
  document: SdkworkSearchDocument;
  matchedOn: "description" | "group" | "keyword" | "scope" | "title";
  score: number;
}

export interface SdkworkSearchResultGroup {
  capabilityIds: string[];
  group: string;
  id: string;
  order: number;
  results: SdkworkSearchResult[];
  scopeIds: string[];
}

export interface FilterSdkworkSearchCatalogOptions {
  capabilityIds?: readonly string[];
  groupIds?: readonly string[];
  scopeIds?: readonly string[];
}

export interface SdkworkSearchCatalogSummary {
  capabilityIds: string[];
  groupIds: string[];
  scopeIds: string[];
  totalDocuments: number;
  totalGroups: number;
}

export interface SdkworkSearchIndexDefinitionInput {
  capability?: string;
  descriptionField?: string;
  enabled?: boolean;
  group?: string;
  groupOrder?: number;
  idField?: string;
  indexId: string;
  keywordFields?: readonly string[];
  kind?: string;
  metadataFields?: readonly string[];
  orderField?: string;
  providerId?: string;
  scope?: string;
  source?: string;
  titleField?: string;
}

export interface SdkworkSearchIndexDefinition {
  capability?: string;
  descriptionField: string;
  enabled: boolean;
  group?: string;
  groupOrder?: number;
  idField: string;
  indexId: string;
  keywordFields: string[];
  kind?: string;
  metadataFields: string[];
  orderField?: string;
  providerId: string;
  scope?: string;
  source: string;
  titleField: string;
}

export type SdkworkSearchIndexSyncMode = "delta" | "full" | "snapshot";

export interface SdkworkSearchIndexSyncPlanOptions {
  batchSize?: number;
  requestId?: string;
  syncMode?: SdkworkSearchIndexSyncMode;
}

export interface SdkworkSearchIndexSyncBatch {
  batchNumber: number;
  documents: SdkworkSearchDocument[];
}

export interface SdkworkSearchIndexSyncPlan {
  batches: SdkworkSearchIndexSyncBatch[];
  index: SdkworkSearchIndexDefinition;
  indexId: string;
  providerId: string;
  requestId: string;
  syncMode: SdkworkSearchIndexSyncMode;
  totalBatches: number;
  totalDocuments: number;
}

export interface SdkworkSearchIndexSyncResponse {
  indexedAt: string;
  indexedCount: number;
  indexId: string;
  providerId: string;
  requestId: string;
  syncMode: SdkworkSearchIndexSyncMode;
  totalBatches: number;
}

export type SdkworkSearchProviderKind =
  | "algolia"
  | "custom"
  | "elasticsearch"
  | "meilisearch"
  | "memory"
  | "opensearch"
  | "postgresql"
  | "typesense"
  | "vector";

export type SdkworkSearchProviderCapability =
  | "analytics"
  | "document_indexing"
  | "event_ingestion"
  | "hybrid_search"
  | "lexical_search"
  | "promotions"
  | "provider_health"
  | "ranking_profiles"
  | "recommendations"
  | "semantic_search"
  | "suggestions"
  | "synonyms";

export type SdkworkSearchProviderStatus =
  | "active"
  | "degraded"
  | "disabled"
  | "error"
  | "unknown";

export interface SdkworkSearchProviderManifest {
  capabilities: SdkworkSearchProviderCapability[];
  config?: Record<string, unknown>;
  defaultFor: SdkworkSearchProviderCapability[];
  displayName: string;
  kind: SdkworkSearchProviderKind;
  metadata?: Record<string, unknown>;
  priority: number;
  providerId: string;
  status: SdkworkSearchProviderStatus;
}

export interface SdkworkSearchProviderManifestInput {
  capabilities: readonly SdkworkSearchProviderCapability[];
  config?: Record<string, unknown>;
  defaultFor?: readonly SdkworkSearchProviderCapability[];
  displayName: string;
  kind: SdkworkSearchProviderKind;
  metadata?: Record<string, unknown>;
  priority: number;
  providerId: string;
  status: SdkworkSearchProviderStatus;
}

export interface SdkworkSearchProviderSelection {
  allowDegraded?: boolean;
  fallbackProviderId?: string;
  preferredKind?: SdkworkSearchProviderKind;
  providerId?: string;
  requiredCapabilities?: readonly SdkworkSearchProviderCapability[];
}

export interface SdkworkSearchProviderRoutedRequest extends SdkworkSearchProviderSelection {
  providerKind?: SdkworkSearchProviderKind;
}

export type SdkworkSearchProviderHealthStatus =
  | "degraded"
  | "healthy"
  | "unavailable"
  | "unknown";

export interface SdkworkSearchProviderHealthCheck {
  checkedAt: string;
  details?: Record<string, unknown>;
  latencyMs?: number;
  providerId: string;
  status: SdkworkSearchProviderHealthStatus;
}

export interface SdkworkSearchQueryRequest extends FilterSdkworkSearchCatalogOptions {
  page?: number;
  pageSize?: number;
  providerId?: string;
  providerKind?: SdkworkSearchProviderKind;
  q?: string;
  requestId?: string;
}

export interface SdkworkSearchPageInfo {
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
}

export interface SdkworkSearchQueryResponse {
  items: SdkworkSearchResult[];
  pageInfo: SdkworkSearchPageInfo;
  q: string;
  requestId: string;
}

export interface SdkworkSearchSuggestionsRequest extends FilterSdkworkSearchCatalogOptions {
  limit?: number;
  providerId?: string;
  providerKind?: SdkworkSearchProviderKind;
  q?: string;
  requestId?: string;
}

export interface SdkworkSearchSuggestion {
  score: number;
  source: "document" | "query";
  text: string;
}

export interface SdkworkSearchSuggestionsResponse {
  items: SdkworkSearchSuggestion[];
  q: string;
  requestId: string;
}

export interface SdkworkRecommendationContext extends FilterSdkworkSearchCatalogOptions {
  placement?: string;
  q?: string;
  recentDocumentIds?: readonly string[];
  userId?: string;
}

export interface SdkworkRecommendationRequest {
  context?: SdkworkRecommendationContext;
  limit?: number;
  providerId?: string;
  providerKind?: SdkworkSearchProviderKind;
  requestId?: string;
  strategyId?: string;
}

export type SdkworkRecommendationStrategyEngine =
  | "custom"
  | "external"
  | "memory"
  | "postgresql"
  | "vector";

export type SdkworkRecommendationStrategyStatus =
  | "active"
  | "archived"
  | "draft"
  | "paused";

export type SdkworkRecommendationStrategyType =
  | "collaborative"
  | "content"
  | "hybrid"
  | "popular"
  | "semantic";

export interface SdkworkRecommendationStrategyDefinition {
  config?: Record<string, unknown>;
  default?: boolean;
  engine: SdkworkRecommendationStrategyEngine;
  metadata?: Record<string, unknown>;
  priority?: number;
  providerId?: string;
  status: SdkworkRecommendationStrategyStatus;
  strategyId: string;
  strategyKey?: string;
  strategyType: SdkworkRecommendationStrategyType;
  title: string;
}

export interface SdkworkRecommendationStrategyInput {
  config?: Record<string, unknown>;
  default?: boolean;
  engine?: SdkworkRecommendationStrategyEngine;
  metadata?: Record<string, unknown>;
  priority?: number;
  providerId?: string;
  status?: SdkworkRecommendationStrategyStatus;
  strategyId: string;
  strategyKey?: string;
  strategyType?: SdkworkRecommendationStrategyType;
  title?: string;
}

export interface SdkworkRecommendationStrategySelection {
  allowInactive?: boolean;
  providerId?: string;
  strategyId?: string;
  strategyType?: SdkworkRecommendationStrategyType;
}

export type SdkworkRecommendationStrategyRegistry =
  Map<string, SdkworkRecommendationStrategyDefinition>;

export interface CreateSdkworkRecommendationResponseOptions {
  strategies?: readonly SdkworkRecommendationStrategyInput[];
}

export interface SdkworkRecommendationItem {
  document: SdkworkSearchDocument;
  reasonCodes: string[];
  score: number;
}

export interface SdkworkRecommendationResponse {
  items: SdkworkRecommendationItem[];
  requestId: string;
  strategyId: string;
}

export interface SdkworkPromotionContext extends FilterSdkworkSearchCatalogOptions {
  placement: string;
  q?: string;
}

export interface SdkworkPromotionRequest {
  context: SdkworkPromotionContext;
  limit?: number;
  providerId?: string;
  providerKind?: SdkworkSearchProviderKind;
  requestId?: string;
}

export interface SdkworkPromotionItem {
  document: SdkworkSearchDocument;
  placement: string;
  reasonCodes: string[];
  score: number;
}

export interface SdkworkPromotionResponse {
  items: SdkworkPromotionItem[];
  placement: string;
  requestId: string;
}

export type SdkworkSearchUserEventType =
  | "click"
  | "conversion"
  | "dismiss"
  | "impression"
  | "save"
  | "view";

export interface SdkworkSearchUserEvent {
  documentId?: string;
  eventType: SdkworkSearchUserEventType;
  indexId?: string;
  metadata?: Record<string, unknown>;
  occurredAt: string;
  placement?: string;
  providerId?: string;
  q?: string;
  requestId?: string;
  resultPosition?: number;
  surface: "app" | "backend" | "local";
}

export interface SdkworkSearchUserEventResponse {
  accepted: boolean;
  requestId: string;
}

export interface SdkworkSemanticSearchQueryRequest extends FilterSdkworkSearchCatalogOptions {
  embeddingProvider?: string;
  limit?: number;
  providerId?: string;
  providerKind?: SdkworkSearchProviderKind;
  q: string;
  requestId?: string;
  semanticProfileId?: string;
}

export interface SdkworkSemanticSearchResult extends SdkworkRecommendationItem {
  lexicalScore: number;
  semanticScore?: number;
}

export interface SdkworkSemanticSearchQueryResponse {
  embeddingProvider: string;
  items: SdkworkSemanticSearchResult[];
  mode: "hybrid" | "semantic";
  q: string;
  requestId: string;
  semanticProfileId: string;
}

export interface SdkworkSearchAnalyticsOverviewInput {
  failedEmbeddingJobs?: number;
  indexedDocuments?: number;
  promotionClicks?: number;
  recommendationClicks?: number;
  requestId?: string;
  searchQueries?: number;
}

export interface SdkworkSearchAnalyticsOverview {
  clickThroughRate: string;
  failedEmbeddingJobs: number;
  indexedDocuments: number;
  promotionClicks: number;
  recommendationClicks: number;
  requestId: string;
  searchQueries: number;
}

function toUniqueStrings(values: readonly string[] | undefined): string[] {
  const normalized: string[] = [];
  const unique = new Set<string>();

  for (const rawValue of values ?? []) {
    const value = rawValue.trim();
    if (!value || unique.has(value)) {
      continue;
    }

    unique.add(value);
    normalized.push(value);
  }

  return normalized;
}

const SDKWORK_SEARCH_PROVIDER_CAPABILITIES: readonly SdkworkSearchProviderCapability[] = [
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

const SDKWORK_SEARCH_PROVIDER_KINDS: readonly SdkworkSearchProviderKind[] = [
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

const SDKWORK_SEARCH_PROVIDER_STATUSES: readonly SdkworkSearchProviderStatus[] = [
  "active",
  "degraded",
  "disabled",
  "error",
  "unknown",
];

const SDKWORK_RECOMMENDATION_STRATEGY_TYPES: readonly SdkworkRecommendationStrategyType[] = [
  "collaborative",
  "content",
  "hybrid",
  "popular",
  "semantic",
];

const SDKWORK_RECOMMENDATION_STRATEGY_STATUSES: readonly SdkworkRecommendationStrategyStatus[] = [
  "active",
  "archived",
  "draft",
  "paused",
];

const SDKWORK_RECOMMENDATION_STRATEGY_ENGINES: readonly SdkworkRecommendationStrategyEngine[] = [
  "custom",
  "external",
  "memory",
  "postgresql",
  "vector",
];

function isSdkworkSearchProviderCapability(
  value: string,
): value is SdkworkSearchProviderCapability {
  return SDKWORK_SEARCH_PROVIDER_CAPABILITIES.includes(value as SdkworkSearchProviderCapability);
}

function isSdkworkSearchProviderKind(value: string): value is SdkworkSearchProviderKind {
  return SDKWORK_SEARCH_PROVIDER_KINDS.includes(value as SdkworkSearchProviderKind);
}

function isSdkworkSearchProviderStatus(value: string): value is SdkworkSearchProviderStatus {
  return SDKWORK_SEARCH_PROVIDER_STATUSES.includes(value as SdkworkSearchProviderStatus);
}

function isSdkworkRecommendationStrategyEngine(
  value: string,
): value is SdkworkRecommendationStrategyEngine {
  return SDKWORK_RECOMMENDATION_STRATEGY_ENGINES.includes(
    value as SdkworkRecommendationStrategyEngine,
  );
}

function isSdkworkRecommendationStrategyStatus(
  value: string,
): value is SdkworkRecommendationStrategyStatus {
  return SDKWORK_RECOMMENDATION_STRATEGY_STATUSES.includes(
    value as SdkworkRecommendationStrategyStatus,
  );
}

function isSdkworkRecommendationStrategyType(
  value: string | undefined,
): value is SdkworkRecommendationStrategyType {
  return SDKWORK_RECOMMENDATION_STRATEGY_TYPES.includes(
    value as SdkworkRecommendationStrategyType,
  );
}

function normalizeProviderCapabilities(
  values: readonly SdkworkSearchProviderCapability[] | undefined,
): SdkworkSearchProviderCapability[] {
  return toUniqueStrings(values).filter(isSdkworkSearchProviderCapability);
}

function isSelectableProvider(
  provider: SdkworkSearchProviderManifest,
  requiredCapabilities: readonly SdkworkSearchProviderCapability[],
  allowDegraded: boolean,
): boolean {
  if (provider.status !== "active" && !(allowDegraded && provider.status === "degraded")) {
    return false;
  }

  return requiredCapabilities.every((capability) => provider.capabilities.includes(capability));
}

function compareProviderPriority(
  left: SdkworkSearchProviderManifest,
  right: SdkworkSearchProviderManifest,
): number {
  return (
    right.priority - left.priority ||
    left.providerId.localeCompare(right.providerId)
  );
}

function clampPositiveInteger(value: number | undefined, fallback: number, max: number): number {
  return Math.min(max, Math.max(1, Math.trunc(value ?? fallback)));
}

function createUniqueSet(values: readonly string[] | undefined): Set<string> {
  return new Set(toUniqueStrings(values));
}

function readSourceValue(
  source: Record<string, unknown>,
  fieldName: string | undefined,
): unknown {
  if (!fieldName) {
    return undefined;
  }

  return source[fieldName];
}

function sourceValueToString(value: unknown): string | undefined {
  if (value === null || value === undefined) {
    return undefined;
  }

  if (typeof value === "string") {
    return coalesce(value);
  }

  if (typeof value === "number" || typeof value === "boolean" || typeof value === "bigint") {
    return String(value);
  }

  return undefined;
}

function sourceValueToInteger(value: unknown): number | undefined {
  if (typeof value === "number" && Number.isFinite(value)) {
    return Math.trunc(value);
  }

  if (typeof value === "string" && !isBlank(value)) {
    const parsed = Number.parseInt(value, 10);
    return Number.isFinite(parsed) ? parsed : undefined;
  }

  return undefined;
}

function sourceValueToStrings(value: unknown): string[] {
  if (Array.isArray(value)) {
    return toUniqueStrings(value.map((item) => sourceValueToString(item) ?? ""));
  }

  const single = sourceValueToString(value);
  return single ? [single] : [];
}

function tokenizeSuggestionText(value: string | undefined): string[] {
  const normalized = value
    ?.trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s]+/g, " ")
    .replace(/\s+/g, " ");
  if (!normalized) {
    return [];
  }

  const words = normalized.split(" ").filter(Boolean);
  const phrases: string[] = [];
  for (let index = 0; index < words.length - 1; index += 1) {
    phrases.push(`${words[index]} ${words[index + 1]}`);
  }

  return [normalized, ...phrases];
}

function addSuggestionCandidate(
  candidates: Map<string, SdkworkSearchSuggestion>,
  text: string,
  q: string,
  source: SdkworkSearchSuggestion["source"],
  baseScore: number,
  matchMode: "includes" | "prefix" = "includes",
): void {
  const normalized = normalizeSdkworkSearchQuery(text);
  const matches = matchMode === "prefix" ? normalized.startsWith(q) : normalized.includes(q);
  if (!normalized || (q && !matches)) {
    return;
  }

  const score = normalized === q
    ? baseScore + 30
    : normalized.startsWith(q)
      ? baseScore + 20
      : baseScore;
  const existing = candidates.get(normalized);
  if (!existing || existing.score < score) {
    candidates.set(normalized, {
      score,
      source,
      text: normalized,
    });
  }
}

function addReasonCode(reasonCodes: string[], reasonCode: string): void {
  if (!reasonCodes.includes(reasonCode)) {
    reasonCodes.push(reasonCode);
  }
}

export function slugifySdkworkSearchValue(value: string): string {
  return (
    value
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || "general"
  );
}

function compareDocuments(
  left: SdkworkSearchDocument,
  right: SdkworkSearchDocument,
): number {
  const leftGroupOrder = left.groupOrder ?? Number.MAX_SAFE_INTEGER;
  const rightGroupOrder = right.groupOrder ?? Number.MAX_SAFE_INTEGER;
  if (leftGroupOrder !== rightGroupOrder) {
    return leftGroupOrder - rightGroupOrder;
  }

  const leftGroup = left.group ?? "General";
  const rightGroup = right.group ?? "General";
  if (leftGroup !== rightGroup) {
    return leftGroup.localeCompare(rightGroup);
  }

  const leftOrder = left.order ?? Number.MAX_SAFE_INTEGER;
  const rightOrder = right.order ?? Number.MAX_SAFE_INTEGER;
  if (leftOrder !== rightOrder) {
    return leftOrder - rightOrder;
  }

  return left.title.localeCompare(right.title);
}

function normalizeDocument(document: SdkworkSearchDocument): SdkworkSearchDocument {
  const capability = coalesce(document.capability);
  const description = coalesce(document.description);
  const group = defaultIfBlank(document.group, "General");
  const kind = coalesce(document.kind);
  const scope = defaultIfBlank(document.scope, "global");
  const source = defaultIfBlank(document.source, "catalog");
  const keywords = toUniqueStrings([
    ...(document.keywords ?? []),
    capability ?? "",
    kind ?? "",
    source,
  ]);

  return {
    ...document,
    ...(capability ? { capability } : {}),
    ...(description ? { description } : {}),
    group,
    ...(kind ? { kind } : {}),
    ...(keywords.length ? { keywords } : {}),
    scope,
    source,
    title: document.title.trim(),
  };
}

function isSdkworkSearchCatalog(
  input: SdkworkSearchCatalog | readonly SdkworkSearchDocument[],
): input is SdkworkSearchCatalog {
  return !Array.isArray(input);
}

function toSearchCatalog(
  input: SdkworkSearchCatalog | readonly SdkworkSearchDocument[],
): SdkworkSearchCatalog {
  return isSdkworkSearchCatalog(input) ? input : createSdkworkSearchCatalog(input);
}

function createScore(
  document: SdkworkSearchDocument,
  matchedOn: SdkworkSearchResult["matchedOn"],
  score: number,
): SdkworkSearchResult {
  return {
    document,
    matchedOn,
    score,
  };
}

function scoreExactPrefixIncludes(
  value: string | undefined,
  query: string,
  matchedOn: SdkworkSearchResult["matchedOn"],
  exactScore: number,
  prefixScore: number,
  includesScore: number,
): SdkworkSearchResult | null {
  const normalized = value?.toLowerCase();
  if (!normalized) {
    return null;
  }

  if (normalized === query) {
    return createScore({ id: "", title: "" }, matchedOn, exactScore);
  }

  if (normalized.startsWith(query)) {
    return createScore({ id: "", title: "" }, matchedOn, prefixScore);
  }

  if (normalized.includes(query)) {
    return createScore({ id: "", title: "" }, matchedOn, includesScore);
  }

  return null;
}

function scoreDocument(document: SdkworkSearchDocument, query: string): SdkworkSearchResult | null {
  const title = document.title.toLowerCase();
  if (title === query) {
    return createScore(document, "title", 160);
  }

  if (title.startsWith(query)) {
    return createScore(document, "title", 140 - document.title.length);
  }

  if (title.includes(query)) {
    return createScore(document, "title", 120 - document.title.length);
  }

  for (const keyword of document.keywords ?? []) {
    const normalizedKeyword = keyword.toLowerCase();
    if (normalizedKeyword === query) {
      return createScore(document, "keyword", 110);
    }

    if (normalizedKeyword.startsWith(query)) {
      return createScore(document, "keyword", 98);
    }

    if (normalizedKeyword.includes(query)) {
      return createScore(document, "keyword", 88);
    }
  }

  const groupScore = scoreExactPrefixIncludes(
    document.group,
    query,
    "group",
    78,
    72,
    66,
  );
  if (groupScore) {
    return {
      ...groupScore,
      document,
    };
  }

  const scopeScore = scoreExactPrefixIncludes(
    document.scope,
    query,
    "scope",
    62,
    58,
    54,
  );
  if (scopeScore) {
    return {
      ...scopeScore,
      document,
    };
  }

  if (document.description?.toLowerCase().includes(query)) {
    return createScore(document, "description", 42);
  }

  return null;
}

export function normalizeSdkworkSearchQuery(value: string): string {
  return trim(value).toLowerCase();
}

export function normalizeSdkworkSearchIndexDefinition(
  input: SdkworkSearchIndexDefinitionInput,
): SdkworkSearchIndexDefinition {
  const indexId = trim(input.indexId);
  if (isBlank(indexId)) {
    throw new Error("Search index definition requires indexId");
  }

  const capability = coalesce(input.capability);
  const group = coalesce(input.group);
  const kind = coalesce(input.kind);
  const orderField = coalesce(input.orderField);
  const scope = coalesce(input.scope);

  return {
    ...(capability ? { capability } : {}),
    descriptionField: defaultIfBlank(input.descriptionField, "description"),
    enabled: input.enabled !== false,
    ...(group ? { group } : {}),
    ...(input.groupOrder !== undefined ? { groupOrder: Math.trunc(input.groupOrder) } : {}),
    idField: defaultIfBlank(input.idField, "id"),
    indexId,
    keywordFields: toUniqueStrings(input.keywordFields),
    ...(kind ? { kind } : {}),
    metadataFields: toUniqueStrings(input.metadataFields),
    ...(orderField ? { orderField } : {}),
    providerId: defaultIfBlank(input.providerId, "postgresql"),
    ...(scope ? { scope } : {}),
    source: defaultIfBlank(input.source, indexId),
    titleField: defaultIfBlank(input.titleField, "title"),
  };
}

export function mapSdkworkSearchIndexSourceItems(
  indexInput: SdkworkSearchIndexDefinitionInput | SdkworkSearchIndexDefinition,
  sourceItems: readonly Record<string, unknown>[],
): SdkworkSearchDocument[] {
  const index = normalizeSdkworkSearchIndexDefinition(indexInput);
  if (!index.enabled) {
    return [];
  }

  return sourceItems.map((sourceItem, position): SdkworkSearchDocument => {
    const rawId = sourceValueToString(readSourceValue(sourceItem, index.idField)) ??
      String(position + 1);
    const title = sourceValueToString(readSourceValue(sourceItem, index.titleField)) ??
      rawId;
    const description = sourceValueToString(readSourceValue(sourceItem, index.descriptionField));
    const order = sourceValueToInteger(readSourceValue(sourceItem, index.orderField));
    const keywords = toUniqueStrings(
      index.keywordFields.flatMap((fieldName) =>
        sourceValueToStrings(readSourceValue(sourceItem, fieldName)),
      ),
    );
    const metadata = index.metadataFields.reduce<Record<string, unknown>>((nextMetadata, fieldName) => {
      const value = readSourceValue(sourceItem, fieldName);
      if (value !== undefined) {
        nextMetadata[fieldName] = value;
      }
      return nextMetadata;
    }, {});

    return {
      ...(index.capability ? { capability: index.capability } : {}),
      ...(description ? { description } : {}),
      ...(index.group ? { group: index.group } : {}),
      ...(index.groupOrder !== undefined ? { groupOrder: index.groupOrder } : {}),
      id: `${index.indexId}:${rawId}`,
      ...(keywords.length ? { keywords } : {}),
      ...(index.kind ? { kind: index.kind } : {}),
      ...(order !== undefined ? { order } : {}),
      ...(index.scope ? { scope: index.scope } : {}),
      source: index.source,
      title,
      ...(Object.keys(metadata).length ? { metadata } : {}),
    };
  });
}

export function createSdkworkSearchIndexSyncPlan(
  indexInput: SdkworkSearchIndexDefinitionInput | SdkworkSearchIndexDefinition,
  sourceItems: readonly Record<string, unknown>[],
  options: SdkworkSearchIndexSyncPlanOptions = {},
): SdkworkSearchIndexSyncPlan {
  const index = normalizeSdkworkSearchIndexDefinition(indexInput);
  const documents = mapSdkworkSearchIndexSourceItems(index, sourceItems);
  const batchSize = clampPositiveInteger(options.batchSize, 100, 1000);
  const batches: SdkworkSearchIndexSyncBatch[] = [];

  for (let pos = 0; pos < documents.length; pos += batchSize) {
    batches.push({
      batchNumber: batches.length + 1,
      documents: documents.slice(pos, pos + batchSize),
    });
  }

  return {
    batches,
    index,
    indexId: index.indexId,
    providerId: index.providerId,
    requestId: options.requestId ?? "",
    syncMode: options.syncMode ?? "delta",
    totalBatches: batches.length,
    totalDocuments: documents.length,
  };
}

export function normalizeSdkworkSearchProviderManifest(
  manifest: SdkworkSearchProviderManifestInput,
): SdkworkSearchProviderManifest {
  const providerId = manifest.providerId.trim();
  if (!providerId) {
    throw new Error("Search provider manifest requires providerId");
  }

  const kind = manifest.kind.trim().toLowerCase();
  if (!isSdkworkSearchProviderKind(kind)) {
    throw new Error(`Unsupported search provider kind: ${manifest.kind}`);
  }

  const capabilities = normalizeProviderCapabilities(manifest.capabilities);
  if (capabilities.length === 0) {
    throw new Error(`Search provider ${providerId} requires at least one capability`);
  }

  const defaultFor = normalizeProviderCapabilities(manifest.defaultFor).filter((capability) =>
    capabilities.includes(capability),
  );
  const status = manifest.status.trim().toLowerCase();

  return {
    ...manifest,
    capabilities,
    defaultFor,
    displayName: defaultIfBlank(manifest.displayName, providerId),
    kind,
    priority: Math.max(0, Math.trunc(manifest.priority)),
    providerId,
    status: isSdkworkSearchProviderStatus(status) ? status : "unknown",
  };
}

export function selectSdkworkSearchProvider(
  manifests: readonly SdkworkSearchProviderManifestInput[],
  selection: SdkworkSearchProviderSelection = {},
): SdkworkSearchProviderManifest {
  const providers = manifests.map(normalizeSdkworkSearchProviderManifest);
  const requiredCapabilities = normalizeProviderCapabilities(selection.requiredCapabilities);
  const allowDegraded = selection.allowDegraded === true;

  const selectable = providers
    .filter((provider) => isSelectableProvider(provider, requiredCapabilities, allowDegraded))
    .sort(compareProviderPriority);

  const findById = (providerId: string | undefined) => {
    const normalizedProviderId = coalesce(providerId);
    if (!normalizedProviderId) {
      return undefined;
    }

    return selectable.find((provider) => provider.providerId === normalizedProviderId);
  };

  const explicitProvider = findById(selection.providerId);
  if (explicitProvider) {
    return explicitProvider;
  }

  const fallbackProvider = findById(selection.fallbackProviderId);
  if (!isBlank(selection.providerId)) {
    if (fallbackProvider) {
      return fallbackProvider;
    }

    throw new Error("No active search provider matches selection");
  }

  const preferredKind = selection.preferredKind?.trim().toLowerCase();
  if (preferredKind && isSdkworkSearchProviderKind(preferredKind)) {
    const kindProvider = selectable.find((provider) => provider.kind === preferredKind);
    if (kindProvider) {
      return kindProvider;
    }
  }

  const defaultProvider = selectable.find((provider) =>
    requiredCapabilities.some((capability) => provider.defaultFor.includes(capability)),
  );
  if (defaultProvider) {
    return defaultProvider;
  }

  if (fallbackProvider) {
    return fallbackProvider;
  }

  const priorityProvider = selectable[0];
  if (priorityProvider) {
    return priorityProvider;
  }

  throw new Error("No active search provider matches selection");
}

export const SDKWORK_POSTGRESQL_SEARCH_PROVIDER_MANIFEST =
  normalizeSdkworkSearchProviderManifest({
    capabilities: [
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
    ],
    defaultFor: [
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
    ],
    displayName: "PostgreSQL Search",
    kind: "postgresql",
    metadata: {
      extensions: ["pg_trgm"],
      optionalExtensions: ["vector"],
    },
    priority: 100,
    providerId: "postgresql",
    status: "active",
  });

export function normalizeSdkworkRecommendationStrategyDefinition(
  strategy: SdkworkRecommendationStrategyInput,
): SdkworkRecommendationStrategyDefinition {
  const strategyId = strategy.strategyId.trim();
  if (!strategyId) {
    throw new Error("Recommendation strategy requires strategyId");
  }

  const strategyType = strategy.strategyType ?? "hybrid";
  if (!isSdkworkRecommendationStrategyType(strategyType)) {
    throw new Error(`Unsupported recommendation strategy type: ${strategy.strategyType}`);
  }

  const engine = (strategy.engine ?? "custom").trim().toLowerCase();
  if (!isSdkworkRecommendationStrategyEngine(engine)) {
    throw new Error(`Unsupported recommendation strategy engine: ${strategy.engine}`);
  }

  const status = (strategy.status ?? "active").trim().toLowerCase();

  return {
    ...strategy,
    default: strategy.default === true,
    engine,
    priority: Math.max(0, Math.trunc(strategy.priority ?? 0)),
    providerId: coalesce(strategy.providerId),
    status: isSdkworkRecommendationStrategyStatus(status) ? status : "draft",
    strategyId,
    strategyKey: defaultIfBlank(strategy.strategyKey, strategyId),
    strategyType,
    title: defaultIfBlank(strategy.title, strategyId),
  };
}

export const SDKWORK_POSTGRESQL_RECOMMENDATION_STRATEGY =
  normalizeSdkworkRecommendationStrategyDefinition({
    config: {
      weights: {
        capability: 90,
        collaborative: 45,
        popular: 25,
        query: 1,
        recent: 40,
        scope: 70,
        semantic: 60,
      },
    },
    default: true,
    engine: "postgresql",
    metadata: {
      extensions: ["pg_trgm"],
      optionalExtensions: ["vector"],
    },
    priority: 100,
    providerId: "postgresql",
    status: "active",
    strategyId: "postgresql-hybrid",
    strategyKey: "postgresql_hybrid",
    strategyType: "hybrid",
    title: "PostgreSQL Hybrid Recommendation",
  });

export const SDKWORK_POSTGRESQL_RECOMMENDATION_STRATEGIES: readonly SdkworkRecommendationStrategyDefinition[] = [
  SDKWORK_POSTGRESQL_RECOMMENDATION_STRATEGY,
  normalizeSdkworkRecommendationStrategyDefinition({
    engine: "postgresql",
    metadata: {
      extensions: ["pg_trgm"],
    },
    priority: 90,
    providerId: "postgresql",
    status: "active",
    strategyId: "postgresql-content",
    strategyKey: "postgresql_content",
    strategyType: "content",
    title: "PostgreSQL Content Recommendation",
  }),
  normalizeSdkworkRecommendationStrategyDefinition({
    engine: "postgresql",
    metadata: {
      eventTables: ["search_user_event"],
    },
    priority: 80,
    providerId: "postgresql",
    status: "active",
    strategyId: "postgresql-popular",
    strategyKey: "postgresql_popular",
    strategyType: "popular",
    title: "PostgreSQL Trending Recommendation",
  }),
  normalizeSdkworkRecommendationStrategyDefinition({
    engine: "postgresql",
    metadata: {
      extensions: ["pg_trgm"],
      optionalExtensions: ["vector"],
    },
    priority: 80,
    providerId: "postgresql",
    status: "active",
    strategyId: "postgresql-semantic",
    strategyKey: "postgresql_semantic",
    strategyType: "semantic",
    title: "PostgreSQL Personalized Recommendation",
  }),
  normalizeSdkworkRecommendationStrategyDefinition({
    engine: "postgresql",
    metadata: {
      eventTables: ["search_user_event"],
    },
    priority: 70,
    providerId: "postgresql",
    status: "active",
    strategyId: "postgresql-collaborative",
    strategyKey: "postgresql_collaborative",
    strategyType: "collaborative",
    title: "PostgreSQL Collaborative Filtering Recommendation",
  }),
];

function compareRecommendationStrategy(
  left: SdkworkRecommendationStrategyDefinition,
  right: SdkworkRecommendationStrategyDefinition,
): number {
  return (
    Number(right.default) - Number(left.default) ||
    (right.priority ?? 0) - (left.priority ?? 0) ||
    left.strategyId.localeCompare(right.strategyId)
  );
}

export function createSdkworkRecommendationStrategyRegistry(
  strategies: readonly SdkworkRecommendationStrategyInput[] = [],
): SdkworkRecommendationStrategyRegistry {
  const registry: SdkworkRecommendationStrategyRegistry = new Map();

  for (const strategy of SDKWORK_POSTGRESQL_RECOMMENDATION_STRATEGIES) {
    registry.set(strategy.strategyId, strategy);
  }

  for (const strategy of strategies) {
    const normalized = normalizeSdkworkRecommendationStrategyDefinition(strategy);
    if (registry.has(normalized.strategyId)) {
      throw new Error(`Duplicate recommendation strategy id: ${normalized.strategyId}`);
    }
    registry.set(normalized.strategyId, normalized);
  }

  return registry;
}

export function selectSdkworkRecommendationStrategy(
  registry: SdkworkRecommendationStrategyRegistry | readonly SdkworkRecommendationStrategyInput[],
  selection: SdkworkRecommendationStrategySelection = {},
): SdkworkRecommendationStrategyDefinition {
  const registeredStrategies: SdkworkRecommendationStrategyDefinition[] = registry instanceof Map
    ? Array.from(registry.values())
    : Array.from(createSdkworkRecommendationStrategyRegistry(registry).values());
  const strategies = registeredStrategies
    .filter((strategy) => selection.allowInactive === true || strategy.status === "active")
    .filter((strategy) => !selection.providerId || strategy.providerId === selection.providerId)
    .sort(compareRecommendationStrategy);

  const requestedStrategyId = selection.strategyId?.trim();
  if (requestedStrategyId && requestedStrategyId !== "default") {
    const explicit = strategies.find((strategy) => strategy.strategyId === requestedStrategyId);
    if (explicit) {
      return explicit;
    }

    throw new Error("No active recommendation strategy matches selection");
  }

  if (selection.strategyType) {
    const strategyByType = strategies.find(
      (strategy) => strategy.strategyType === selection.strategyType,
    );
    if (strategyByType) {
      return strategyByType;
    }
  }

  const defaultStrategy = strategies.find((strategy) => strategy.default);
  if (defaultStrategy) {
    return defaultStrategy;
  }

  const priorityStrategy = strategies[0];
  if (priorityStrategy) {
    return priorityStrategy;
  }

  throw new Error("No active recommendation strategy matches selection");
}

export function createSdkworkSearchCatalog(
  documents: readonly SdkworkSearchDocument[],
): SdkworkSearchCatalog {
  const documentsById: Record<string, SdkworkSearchDocument> = {};
  const groups = new Map<string, SdkworkSearchGroup>();
  const capabilityIds: string[] = [];
  const scopeIds: string[] = [];
  const normalizedDocuments = documents
    .filter((document) => document.enabled !== false)
    .map(normalizeDocument)
    .sort(compareDocuments);

  for (const document of normalizedDocuments) {
    if (documentsById[document.id]) {
      throw new Error(`Duplicate search document id: ${document.id}`);
    }

    documentsById[document.id] = document;

    if (document.capability && !capabilityIds.includes(document.capability)) {
      capabilityIds.push(document.capability);
    }

    if (document.scope && !scopeIds.includes(document.scope)) {
      scopeIds.push(document.scope);
    }

    const groupId = slugifySdkworkSearchValue(document.group ?? "General");
    const existingGroup = groups.get(groupId);

    if (existingGroup) {
      existingGroup.documentIds.push(document.id);
      if (document.capability && !existingGroup.capabilityIds.includes(document.capability)) {
        existingGroup.capabilityIds.push(document.capability);
      }
      if (document.scope && !existingGroup.scopeIds.includes(document.scope)) {
        existingGroup.scopeIds.push(document.scope);
      }
      continue;
    }

    groups.set(groupId, {
      capabilityIds: document.capability ? [document.capability] : [],
      documentIds: [document.id],
      heading: document.group ?? "General",
      id: groupId,
      order: document.groupOrder ?? Number.MAX_SAFE_INTEGER,
      scopeIds: document.scope ? [document.scope] : [],
    });
  }

  return {
    capabilityIds,
    documents: normalizedDocuments,
    documentsById,
    groups: Array.from(groups.values()).sort(
      (left, right) => left.order - right.order || left.heading.localeCompare(right.heading),
    ),
    scopeIds,
  };
}

export function filterSdkworkSearchCatalog(
  input: SdkworkSearchCatalog | readonly SdkworkSearchDocument[],
  options: FilterSdkworkSearchCatalogOptions = {},
): SdkworkSearchCatalog {
  const catalog = toSearchCatalog(input);
  const capabilityFilter = new Set(toUniqueStrings(options.capabilityIds));
  const groupFilter = new Set(toUniqueStrings(options.groupIds));
  const scopeFilter = new Set(toUniqueStrings(options.scopeIds));

  return createSdkworkSearchCatalog(
    catalog.documents.filter((document) => {
      if (capabilityFilter.size > 0 && !capabilityFilter.has(document.capability ?? "")) {
        return false;
      }

      if (groupFilter.size > 0 && !groupFilter.has(slugifySdkworkSearchValue(document.group ?? "General"))) {
        return false;
      }

      if (scopeFilter.size > 0 && !scopeFilter.has(document.scope ?? "global")) {
        return false;
      }

      return true;
    }),
  );
}

export function searchSdkworkSearchCatalog(
  input: SdkworkSearchCatalog | readonly SdkworkSearchDocument[],
  rawQuery: string,
  options: FilterSdkworkSearchCatalogOptions = {},
): SdkworkSearchResult[] {
  const catalog = filterSdkworkSearchCatalog(input, options);
  const query = normalizeSdkworkSearchQuery(rawQuery);
  const orderIndex = new Map(catalog.documents.map((document, index) => [document.id, index]));

  if (!query) {
    return catalog.documents.map((document, index) => ({
      document,
      matchedOn: "title" as const,
      score: Math.max(1, 100 - index),
    }));
  }

  return catalog.documents
    .map((document) => scoreDocument(document, query))
    .filter((result): result is SdkworkSearchResult => result !== null)
    .sort(
      (left, right) =>
        right.score - left.score ||
        (orderIndex.get(left.document.id) ?? Number.MAX_SAFE_INTEGER) -
          (orderIndex.get(right.document.id) ?? Number.MAX_SAFE_INTEGER),
    );
}

export function groupSdkworkSearchResults(
  results: readonly SdkworkSearchResult[],
): SdkworkSearchResultGroup[] {
  const grouped = new Map<string, SdkworkSearchResultGroup>();

  for (const result of results) {
    const group = result.document.group ?? "General";
    const groupId = slugifySdkworkSearchValue(group);
    const existing = grouped.get(groupId);

    if (existing) {
      existing.results.push(result);
      if (result.document.capability && !existing.capabilityIds.includes(result.document.capability)) {
        existing.capabilityIds.push(result.document.capability);
      }
      if (result.document.scope && !existing.scopeIds.includes(result.document.scope)) {
        existing.scopeIds.push(result.document.scope);
      }
      continue;
    }

    grouped.set(groupId, {
      capabilityIds: result.document.capability ? [result.document.capability] : [],
      group,
      id: groupId,
      order: result.document.groupOrder ?? Number.MAX_SAFE_INTEGER,
      results: [result],
      scopeIds: result.document.scope ? [result.document.scope] : [],
    });
  }

  return Array.from(grouped.values()).sort(
    (left, right) => left.order - right.order || left.group.localeCompare(right.group),
  );
}

export function summarizeSdkworkSearchCatalog(
  catalog: SdkworkSearchCatalog,
): SdkworkSearchCatalogSummary {
  return {
    capabilityIds: [...catalog.capabilityIds],
    groupIds: catalog.groups.map((group) => group.id),
    scopeIds: [...catalog.scopeIds],
    totalDocuments: catalog.documents.length,
    totalGroups: catalog.groups.length,
  };
}

export function searchDocuments(
  documents: readonly SdkworkSearchDocument[],
  rawQuery: string,
  options: FilterSdkworkSearchCatalogOptions = {},
): SdkworkSearchResult[] {
  return searchSdkworkSearchCatalog(createSdkworkSearchCatalog(documents), rawQuery, options);
}

export function groupSearchResults(
  results: readonly SdkworkSearchResult[],
): SdkworkSearchResultGroup[] {
  return groupSdkworkSearchResults(results);
}

export function createSdkworkSearchQueryResponse(
  input: SdkworkSearchCatalog | readonly SdkworkSearchDocument[],
  request: SdkworkSearchQueryRequest,
): SdkworkSearchQueryResponse {
  const page = Math.max(1, Math.trunc(request.page ?? 1));
  const pageSize = Math.min(200, Math.max(1, Math.trunc(request.pageSize ?? 20)));
  const q = normalizeSdkworkSearchQuery(request.q ?? "");
  const results = searchSdkworkSearchCatalog(input, q, request);
  const pos = (page - 1) * pageSize;
  const items = results.slice(pos, pos + pageSize);

  return {
    items,
    pageInfo: {
      page,
      pageSize,
      totalItems: results.length,
      totalPages: Math.max(1, Math.ceil(results.length / pageSize)),
    },
    q,
    requestId: request.requestId ?? "",
  };
}

export function createSdkworkSearchSuggestionsResponse(
  input: SdkworkSearchCatalog | readonly SdkworkSearchDocument[],
  request: SdkworkSearchSuggestionsRequest,
): SdkworkSearchSuggestionsResponse {
  const catalog = filterSdkworkSearchCatalog(input, request);
  const q = normalizeSdkworkSearchQuery(request.q ?? "");
  const limit = clampPositiveInteger(request.limit, 10, 50);
  const candidates = new Map<string, SdkworkSearchSuggestion>();

  for (const document of catalog.documents) {
    addSuggestionCandidate(candidates, document.title, q, "document", 100);
    for (const keyword of document.keywords ?? []) {
      if (normalizeSdkworkSearchQuery(keyword) === normalizeSdkworkSearchQuery(document.source ?? "")) {
        continue;
      }
      addSuggestionCandidate(candidates, keyword, q, "document", 90);
    }
    for (const phrase of tokenizeSuggestionText(document.description)) {
      addSuggestionCandidate(candidates, phrase, q, "query", 70, "prefix");
    }
    addSuggestionCandidate(candidates, document.group ?? "", q, "document", 60);
  }

  return {
    items: Array.from(candidates.values())
      .sort((left, right) => right.score - left.score || left.text.localeCompare(right.text))
      .slice(0, limit),
    q,
    requestId: request.requestId ?? "",
  };
}

export function createSdkworkRecommendationResponse(
  input: SdkworkSearchCatalog | readonly SdkworkSearchDocument[],
  request: SdkworkRecommendationRequest,
  options: CreateSdkworkRecommendationResponseOptions = {},
): SdkworkRecommendationResponse {
  const context = request.context ?? {};
  const catalog = filterSdkworkSearchCatalog(input, {
    groupIds: context.groupIds,
  });
  const registry = createSdkworkRecommendationStrategyRegistry(options.strategies);
  let strategy = SDKWORK_POSTGRESQL_RECOMMENDATION_STRATEGY;
  try {
    strategy = selectSdkworkRecommendationStrategy(registry, {
      strategyId: request.strategyId,
    });
  } catch (error) {
    strategy = selectSdkworkRecommendationStrategy(registry);
  }
  const capabilityFilter = createUniqueSet(context.capabilityIds);
  const scopeFilter = createUniqueSet(context.scopeIds);
  const recentDocumentIds = createUniqueSet(context.recentDocumentIds);
  const queryMatches = searchSdkworkSearchCatalog(catalog, context.q ?? "");
  const queryScoreByDocumentId = new Map(
    queryMatches.map((result) => [result.document.id, result.score]),
  );
  const limit = clampPositiveInteger(request.limit, 10, 100);

  const items = catalog.documents.map((document, index): SdkworkRecommendationItem => {
    const reasonCodes: string[] = [];
    let score = Math.max(1, 70 - index);
    addReasonCode(reasonCodes, `strategy_${strategy.strategyType}`);

    if (capabilityFilter.size > 0 && capabilityFilter.has(document.capability ?? "")) {
      addReasonCode(reasonCodes, "capability_match");
      score += 90;
    }

    if (scopeFilter.size > 0 && scopeFilter.has(document.scope ?? "global")) {
      addReasonCode(reasonCodes, "scope_match");
      score += 70;
    }

    const queryScore = queryScoreByDocumentId.get(document.id);
    if (queryScore !== undefined) {
      addReasonCode(reasonCodes, "query_match");
      score += queryScore;
    }

    if (recentDocumentIds.has(document.id)) {
      addReasonCode(reasonCodes, "recent_activity");
      score += 40;
    }

    if (
      strategy.strategyType === "popular" ||
      strategy.strategyType === "collaborative" ||
      (strategy.strategyType === "hybrid" && recentDocumentIds.has(document.id))
    ) {
      addReasonCode(reasonCodes, "popular_signal");
      score += recentDocumentIds.has(document.id) ? 35 : Math.max(1, 25 - index);
    }

    if (
      strategy.strategyType === "collaborative" ||
      (strategy.strategyType === "hybrid" && context.userId)
    ) {
      addReasonCode(reasonCodes, "collaborative_signal");
      score += recentDocumentIds.has(document.id) ? 45 : Math.max(1, 18 - index);
    }

    if (
      strategy.strategyType === "content" ||
      strategy.strategyType === "hybrid" ||
      strategy.strategyType === "semantic"
    ) {
      addReasonCode(reasonCodes, "content_signal");
      score += Math.max(1, 20 - index);
    }

    if (
      strategy.strategyType === "semantic" ||
      (strategy.strategyType === "hybrid" && queryScore !== undefined)
    ) {
      addReasonCode(reasonCodes, "semantic_signal");
      score += queryScore !== undefined ? 60 : Math.max(1, 12 - index);
    }

    if (reasonCodes.length === 1) {
      addReasonCode(reasonCodes, "catalog_order");
    }

    return {
      document,
      reasonCodes,
      score,
    };
  });

  return {
    items: items
      .sort(
        (left, right) =>
          right.score - left.score || left.document.title.localeCompare(right.document.title),
      )
      .slice(0, limit),
    requestId: request.requestId ?? "",
    strategyId: strategy.strategyId,
  };
}

export function createSdkworkPromotionResponse(
  input: SdkworkSearchCatalog | readonly SdkworkSearchDocument[],
  request: SdkworkPromotionRequest,
): SdkworkPromotionResponse {
  const context = request.context;
  const catalog = filterSdkworkSearchCatalog(input, context);
  const capabilityFilter = createUniqueSet(context.capabilityIds);
  const scopeFilter = createUniqueSet(context.scopeIds);
  const queryScoreByDocumentId = new Map(
    searchSdkworkSearchCatalog(catalog, context.q ?? "").map((result) => [
      result.document.id,
      result.score,
    ]),
  );
  const limit = clampPositiveInteger(request.limit, 10, 50);

  const items = catalog.documents
    .map((document, index): SdkworkPromotionItem => {
      const reasonCodes = ["placement_match"];
      let score = Math.max(1, 80 - index);

      if (capabilityFilter.size > 0 && capabilityFilter.has(document.capability ?? "")) {
        reasonCodes.push("capability_match");
        score += 70;
      }

      if (scopeFilter.size > 0 && scopeFilter.has(document.scope ?? "global")) {
        reasonCodes.push("scope_match");
        score += 50;
      }

      const queryScore = queryScoreByDocumentId.get(document.id);
      if (queryScore !== undefined) {
        reasonCodes.push("query_match");
        score += queryScore;
      }

      return {
        document,
        placement: context.placement,
        reasonCodes,
        score,
      };
    })
    .filter((item) => {
      if (capabilityFilter.size > 0 && !item.reasonCodes.includes("capability_match")) {
        return false;
      }
      if (scopeFilter.size > 0 && !item.reasonCodes.includes("scope_match")) {
        return false;
      }
      return true;
    });

  return {
    items: items
      .sort(
        (left, right) =>
          right.score - left.score || left.document.title.localeCompare(right.document.title),
      )
      .slice(0, limit),
    placement: context.placement,
    requestId: request.requestId ?? "",
  };
}

export function normalizeSdkworkSearchUserEvent(
  event: SdkworkSearchUserEvent,
): SdkworkSearchUserEvent {
  return {
    ...event,
    ...(event.documentId?.trim() ? { documentId: event.documentId.trim() } : {}),
    ...(event.indexId?.trim() ? { indexId: event.indexId.trim() } : {}),
    ...(event.placement?.trim() ? { placement: event.placement.trim() } : {}),
    ...(event.q !== undefined ? { q: normalizeSdkworkSearchQuery(event.q) } : {}),
    ...(event.requestId?.trim() ? { requestId: event.requestId.trim() } : {}),
  };
}

export function createSdkworkSemanticSearchQueryResponse(
  input: SdkworkSearchCatalog | readonly SdkworkSearchDocument[],
  request: SdkworkSemanticSearchQueryRequest,
): SdkworkSemanticSearchQueryResponse {
  const q = normalizeSdkworkSearchQuery(request.q);
  const limit = clampPositiveInteger(request.limit, 10, 100);
  const directResults = searchSdkworkSearchCatalog(input, q, request);
  const lexicalResults = directResults.length > 0
    ? directResults
    : Array.from(
        q
          .split(/\s+/)
          .filter(Boolean)
          .reduce((merged, token) => {
            for (const result of searchSdkworkSearchCatalog(input, token, request)) {
              const existing = merged.get(result.document.id);
              merged.set(result.document.id, {
                ...result,
                score: (existing?.score ?? 0) + result.score,
              });
            }
            return merged;
          }, new Map<string, SdkworkSearchResult>())
          .values(),
      ).sort(
        (left, right) =>
          right.score - left.score || left.document.title.localeCompare(right.document.title),
      );

  return {
    embeddingProvider: request.embeddingProvider ?? "postgresql",
    items: lexicalResults.slice(0, limit).map((result): SdkworkSemanticSearchResult => ({
      document: result.document,
      lexicalScore: result.score,
      reasonCodes: ["lexical_fallback", `${result.matchedOn}_match`],
      score: result.score,
    })),
    mode: "semantic",
    q,
    requestId: request.requestId ?? "",
    semanticProfileId: request.semanticProfileId ?? "default",
  };
}

export function createSdkworkSearchAnalyticsOverview(
  input: SdkworkSearchAnalyticsOverviewInput,
): SdkworkSearchAnalyticsOverview {
  const searchQueries = Math.max(0, Math.trunc(input.searchQueries ?? 0));
  const recommendationClicks = Math.max(0, Math.trunc(input.recommendationClicks ?? 0));
  const promotionClicks = Math.max(0, Math.trunc(input.promotionClicks ?? 0));
  const totalClicks = recommendationClicks + promotionClicks;
  const clickThroughRate = searchQueries === 0 ? "0.0000" : (totalClicks / searchQueries).toFixed(4);

  return {
    clickThroughRate,
    failedEmbeddingJobs: Math.max(0, Math.trunc(input.failedEmbeddingJobs ?? 0)),
    indexedDocuments: Math.max(0, Math.trunc(input.indexedDocuments ?? 0)),
    promotionClicks,
    recommendationClicks,
    requestId: input.requestId ?? "",
    searchQueries,
  };
}

export const createSearchCatalog = createSdkworkSearchCatalog;
export const normalizeSearchIndexDefinition = normalizeSdkworkSearchIndexDefinition;
export const mapSearchIndexSourceItems = mapSdkworkSearchIndexSourceItems;
export const createSearchIndexSyncPlan = createSdkworkSearchIndexSyncPlan;
export const filterSearchCatalog = filterSdkworkSearchCatalog;
export const searchCatalog = searchSdkworkSearchCatalog;
export const groupSearchCatalogResults = groupSdkworkSearchResults;
export const createSearchSuggestionsResponse = createSdkworkSearchSuggestionsResponse;
export const createRecommendationResponse = createSdkworkRecommendationResponse;
export const createPromotionResponse = createSdkworkPromotionResponse;
export const createSemanticSearchQueryResponse = createSdkworkSemanticSearchQueryResponse;
export const createSearchAnalyticsOverview = createSdkworkSearchAnalyticsOverview;
