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

export interface SdkworkSearchQueryRequest extends FilterSdkworkSearchCatalogOptions {
  page?: number;
  pageSize?: number;
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
  const capability = document.capability?.trim();
  const description = document.description?.trim();
  const group = document.group?.trim() || "General";
  const kind = document.kind?.trim();
  const scope = document.scope?.trim() || "global";
  const source = document.source?.trim() || "catalog";
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
  return value.trim().toLowerCase();
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
  const offset = (page - 1) * pageSize;
  const items = results.slice(offset, offset + pageSize);

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

export const createSearchCatalog = createSdkworkSearchCatalog;
export const filterSearchCatalog = filterSdkworkSearchCatalog;
export const searchCatalog = searchSdkworkSearchCatalog;
export const groupSearchCatalogResults = groupSdkworkSearchResults;
