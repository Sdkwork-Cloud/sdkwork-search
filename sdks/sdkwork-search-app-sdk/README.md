# SDKWork Search App SDK

This SDK family is generated from the `sdkwork-search-app-api` authority contract for `/app/v3/api`.

## Contract

- SDK family: `sdkwork-search-app-sdk`
- API authority: `sdkwork-search-app-api`
- API prefix: `/app/v3/api`
- Audience: app, desktop, mobile, H5, and user-facing clients
- Auth mode: `Authorization: Bearer <auth_token>` plus `Access-Token: <access_token>` for protected operations
- Request context: server middleware resolves `AppRequestContext`; clients must not send `X-Request-Id`

## Generation

Run from `D:\sdkwork-opensource\sdkwork-search`:

```powershell
node .\sdks\materialize-search-v3-openapi-boundaries.mjs
.\sdks\sdkwork-search-app-sdk\bin\generate-sdk.ps1 -Languages typescript
```

The wrapper calls `D:\javasource\spring-ai-plus\sdk\sdkwork-sdk-generator\bin\sdkgen.js` with `--standard-profile sdkwork-v3`.

