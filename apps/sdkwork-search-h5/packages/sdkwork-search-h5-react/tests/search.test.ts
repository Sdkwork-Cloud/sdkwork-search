import { describe, expect, it } from "vitest";
import {
  createSdkworkSearchCatalog,
  createSdkworkSearchManifest,
  filterSdkworkSearchCatalog,
  groupSearchResults,
  groupSdkworkSearchResults,
  searchDocuments,
  searchSdkworkSearchCatalog,
  summarizeSdkworkSearchCatalog,
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
  {
    capability: "docs",
    description: "Review workspace onboarding docs and release notes",
    group: "Help",
    groupOrder: 3,
    id: "docs",
    keywords: ["manual", "guide"],
    order: 1,
    scope: "global",
    source: "docs",
    title: "Documentation",
  },
  {
    capability: "conversation",
    description: "Review historical chat transcripts",
    group: "Navigation",
    groupOrder: 1,
    id: "history",
    keywords: ["archive"],
    order: 2,
    scope: "workspace",
    source: "chat",
    title: "Chat History",
  },
  {
    enabled: false,
    group: "Help",
    id: "disabled",
    title: "Disabled",
  },
];

describe("sdkwork-search-h5-react", () => {
  it("creates a normalized mobile search catalog with deterministic metadata", () => {
    const catalog = createSdkworkSearchCatalog(documents);

    expect(catalog.documents.map((item) => item.id)).toEqual([
      "chat",
      "history",
      "models",
      "docs",
    ]);
    expect(catalog.groups.map((group) => group.id)).toEqual([
      "navigation",
      "ai",
      "help",
    ]);
    expect(catalog.scopeIds).toEqual(["global", "workspace"]);
    expect(catalog.capabilityIds).toEqual([
      "command",
      "conversation",
      "intelligence",
      "docs",
    ]);
    expect(summarizeSdkworkSearchCatalog(catalog)).toEqual({
      capabilityIds: ["command", "conversation", "intelligence", "docs"],
      groupIds: ["navigation", "ai", "help"],
      scopeIds: ["global", "workspace"],
      totalDocuments: 4,
      totalGroups: 3,
    });
  });

  it("rejects duplicate mobile search document ids", () => {
    expect(() =>
      createSdkworkSearchCatalog([
        ...documents,
        {
          id: "chat",
          title: "Duplicate",
        },
      ]),
    ).toThrowError("Duplicate search document id: chat");
  });

  it("ranks title matches ahead of group and description matches and keeps legacy aliases working", () => {
    const catalog = createSdkworkSearchCatalog(documents);
    const titleResults = searchSdkworkSearchCatalog(catalog, "chat");

    expect(titleResults.map((item) => item.document.id)).toEqual(["chat", "history"]);
    expect(titleResults[0]?.matchedOn).toBe("title");

    const groupResults = searchSdkworkSearchCatalog(catalog, "navigation");
    expect(groupResults.map((item) => item.document.id)).toEqual(["chat", "history"]);
    expect(groupResults[0]?.matchedOn).toBe("group");

    expect(searchDocuments(documents, "chat")).toEqual(titleResults);
  });

  it("filters mobile search catalogs by capability and scope and preserves group order in grouped results", () => {
    const catalog = createSdkworkSearchCatalog(documents);
    const filtered = filterSdkworkSearchCatalog(catalog, {
      capabilityIds: ["conversation", "intelligence"],
      scopeIds: ["workspace"],
    });

    expect(filtered.documents.map((item) => item.id)).toEqual(["history", "models"]);
    expect(groupSdkworkSearchResults(searchSdkworkSearchCatalog(catalog, ""))).toMatchObject([
      {
        capabilityIds: ["command", "conversation"],
        group: "Navigation",
        id: "navigation",
        scopeIds: ["global", "workspace"],
      },
      {
        capabilityIds: ["intelligence"],
        group: "AI",
        id: "ai",
        scopeIds: ["workspace"],
      },
      {
        capabilityIds: ["docs"],
        group: "Help",
        id: "help",
        scopeIds: ["global"],
      },
    ]);
  });

  it("creates a mobile search manifest from the normalized catalog", () => {
    const catalog = createSdkworkSearchCatalog(documents);
    const manifest = createSdkworkSearchManifest({
      catalog,
      packageNames: [
        "@sdkwork/search-h5-react",
        "@sdkwork/search-h5-react",
      ],
    });

    expect(manifest).toMatchObject({
      capability: "search",
      capabilityIds: ["command", "conversation", "intelligence", "docs"],
      groupIds: ["navigation", "ai", "help"],
      host: "capacitor",
      scopeIds: ["global", "workspace"],
      title: "Search",
    });
    expect(manifest.packageNames).toEqual(["@sdkwork/search-h5-react"]);
    expect(groupSearchResults(searchDocuments(documents, ""))).toHaveLength(3);
  });
});
