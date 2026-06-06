import { describe, expect, it } from "vitest";
import {
  createSdkworkSearchCatalog,
  createSdkworkSearchQueryResponse,
  normalizeSdkworkSearchQuery,
  searchSdkworkSearchCatalog,
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
});
