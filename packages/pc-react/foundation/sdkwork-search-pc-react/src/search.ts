export {
  createSearchCatalog,
  createSdkworkSearchCatalog,
  createSdkworkSearchQueryResponse,
  filterSearchCatalog,
  filterSdkworkSearchCatalog,
  groupSearchCatalogResults,
  groupSearchResults,
  groupSdkworkSearchResults,
  normalizeSdkworkSearchQuery,
  searchCatalog,
  searchDocuments,
  searchSdkworkSearchCatalog,
  slugifySdkworkSearchValue,
  summarizeSdkworkSearchCatalog,
  type FilterSdkworkSearchCatalogOptions,
  type SdkworkSearchCatalog,
  type SdkworkSearchCatalogSummary,
  type SdkworkSearchDocument,
  type SdkworkSearchGroup,
  type SdkworkSearchPageInfo,
  type SdkworkSearchQueryRequest,
  type SdkworkSearchQueryResponse,
  type SdkworkSearchResult,
  type SdkworkSearchResultGroup,
} from "@sdkwork/search-contracts";

import type { SdkworkSearchCatalog } from "@sdkwork/search-contracts";

export type SdkworkShellThemeColor = "zinc" | "lobster" | "green-tech" | "tech-blue" | "violet" | "rose";
export type SdkworkShellThemeSelection = "light" | "dark" | "system";
export type SdkworkPcReactHost = "browser" | "server" | "tauri";

export interface SdkworkAppCapabilityThemePreset {
  color: SdkworkShellThemeColor;
  preset: "sdkwork";
  selection: SdkworkShellThemeSelection;
}

export interface SdkworkAppCapabilityManifest {
  architecture: "pc-react";
  description?: string;
  host: SdkworkPcReactHost;
  id: string;
  packageNames: string[];
  theme: SdkworkAppCapabilityThemePreset;
  title: string;
}

export interface SdkworkSearchManifest extends SdkworkAppCapabilityManifest {
  capability: "search";
  capabilityIds: string[];
  groupIds: string[];
  scopeIds: string[];
}

export interface CreateSdkworkSearchManifestOptions {
  catalog?: SdkworkSearchCatalog;
  description?: string;
  host?: SdkworkPcReactHost;
  id?: string;
  packageNames?: string[];
  theme?: Partial<SdkworkAppCapabilityThemePreset>;
  title?: string;
}

function toUniqueStrings(values: readonly string[] | undefined): string[] {
  return Array.from(new Set((values ?? []).map((value) => value.trim()).filter(Boolean)));
}

export function createSdkworkSearchManifest({
  catalog,
  description = "Search catalog for cross-capability discovery, global launcher results, and scoped desktop retrieval.",
  host = "tauri",
  id = "sdkwork-search",
  packageNames = ["@sdkwork/search-pc-react"],
  theme,
  title = "Search",
}: CreateSdkworkSearchManifestOptions = {}): SdkworkSearchManifest {
  return {
    architecture: "pc-react",
    capability: "search",
    capabilityIds: catalog?.capabilityIds ?? [],
    description,
    groupIds: catalog?.groups.map((group) => group.id) ?? [],
    host,
    id,
    packageNames: toUniqueStrings(packageNames),
    scopeIds: catalog?.scopeIds ?? [],
    theme: {
      color: "lobster",
      preset: "sdkwork",
      selection: "system",
      ...theme,
    },
    title,
  };
}

export const searchPackageMeta = {
  architecture: "pc-react",
  domain: "foundation",
  package: "@sdkwork/search-pc-react",
  status: "ready",
} as const;

export type SearchPackageMeta = typeof searchPackageMeta;

export const createSearchManifest = createSdkworkSearchManifest;
