# SDKWork Search SDK Workspace

This directory owns the SDK generation inputs for `sdkwork-search`.

## Families

- `sdkwork-search-app-sdk` generates app/client SDKs from `sdkwork-search-app-api` under `/app/v3/api`.
- `sdkwork-search-backend-sdk` generates backend/admin SDKs from `sdkwork-search-backend-api` under `/backend/v3/api`.

Both families are owner-only. They generate only operations with `x-sdkwork-owner: sdkwork-search` and declare `contracts.sdkDependencies: []`.

## Workflow

Run from `D:\sdkwork-opensource\sdkwork-search`:

```powershell
node .\sdks\materialize-search-v3-openapi-boundaries.mjs
.\sdks\sdkwork-search-app-sdk\bin\generate-sdk.ps1 -Languages typescript
.\sdks\sdkwork-search-backend-sdk\bin\generate-sdk.ps1 -Languages typescript
pnpm test:governance
```

The generation wrappers call the canonical SDKWork generator:

```text
D:\javasource\spring-ai-plus\sdk\sdkwork-sdk-generator\bin\sdkgen.js
```

