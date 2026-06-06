# SDKWork Search Backend SDK

This SDK family is generated from the `sdkwork-search-backend-api` authority contract for `/backend/v3/api`.

## Contract

- SDK family: `sdkwork-search-backend-sdk`
- API authority: `sdkwork-search-backend-api`
- API prefix: `/backend/v3/api`
- Audience: backend console, operators, control plane, and admin integrations
- Auth mode: `Authorization: Bearer <auth_token>` plus `Access-Token: <access_token>` for protected operations
- Request context: server middleware resolves `BackendRequestContext`; clients must not send `X-Request-Id`

## Generation

Run from `D:\sdkwork-opensource\sdkwork-search`:

```powershell
node .\sdks\materialize-search-v3-openapi-boundaries.mjs
.\sdks\sdkwork-search-backend-sdk\bin\generate-sdk.ps1 -Languages typescript
```

The wrapper calls `D:\javasource\spring-ai-plus\sdk\sdkwork-sdk-generator\bin\sdkgen.js` with `--standard-profile sdkwork-v3`.

