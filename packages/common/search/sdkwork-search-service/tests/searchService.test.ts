import { describe, expect, it } from "vitest";
import {
  createSdkworkSearchService,
  type SdkworkSearchAppSdkClient,
  type SdkworkSearchBackendSdkClient,
} from "../src";
import type { SdkworkSearchDocument } from "@sdkwork/search-contracts";

const localDocuments: SdkworkSearchDocument[] = [
  {
    capability: "command",
    description: "Open chat",
    group: "Navigation",
    id: "chat",
    scope: "global",
    title: "Chat",
  },
  {
    capability: "knowledge",
    description: "Search knowledge sources",
    group: "AI",
    id: "knowledge",
    scope: "workspace",
    title: "Knowledge",
  },
];

describe("@sdkwork/search-service", () => {
  it("queries the injected app SDK client when one is provided", async () => {
    const appClient: SdkworkSearchAppSdkClient = {
      search: {
        queries: {
          create: async (body) => ({
            items: [],
            pageInfo: {
              page: 1,
              pageSize: 20,
              totalItems: 0,
              totalPages: 1,
            },
            q: body.q,
            requestId: "from-sdk",
          }),
        },
      },
    };
    const service = createSdkworkSearchService({ appClient, localDocuments });

    await expect(service.query({ q: "chat" })).resolves.toMatchObject({
      q: "chat",
      requestId: "from-sdk",
    });
  });

  it("uses the local catalog fallback without raw HTTP", async () => {
    const service = createSdkworkSearchService({ localDocuments });
    const response = await service.query({ q: "knowledge" });

    expect(response.items.map((item) => item.document.id)).toEqual(["knowledge"]);
    expect(response.requestId).toMatch(/^local-search-/);
  });

  it("delegates backend document indexing through the injected backend SDK", async () => {
    const indexed: SdkworkSearchDocument[] = [];
    const backendClient: SdkworkSearchBackendSdkClient = {
      search: {
        documents: {
          upsert: async (_indexId, body) => {
            indexed.push(body.document);
            return {
              document: body.document,
              indexedAt: "2026-06-06T00:00:00.000Z",
              requestId: "backend-sdk",
            };
          },
        },
      },
    };
    const service = createSdkworkSearchService({ backendClient });

    await expect(
      service.upsertDocument("global", {
        id: "settings",
        title: "Settings",
      }),
    ).resolves.toMatchObject({
      requestId: "backend-sdk",
    });
    expect(indexed.map((document) => document.id)).toEqual(["settings"]);
  });

  it("fails backend writes when no backend SDK client is configured", async () => {
    const service = createSdkworkSearchService({ localDocuments });

    await expect(
      service.upsertDocument("global", {
        id: "settings",
        title: "Settings",
      }),
    ).rejects.toThrowError("Missing search backend SDK client");
  });
});
