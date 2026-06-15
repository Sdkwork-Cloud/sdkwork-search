# sdks/

SDK family workspaces, SDK generation manifests, authority OpenAPI materialization outputs, derived `sdkgen` inputs, generated SDK language workspaces, and SDK component specs.

## Purpose

Contains SDK generation inputs and generated SDK families for the `sdkwork-search` workspace.

## SDK Families

| Family | Authority | Surface | Description |
| --- | --- | --- | --- |
| `sdkwork-search-app-sdk` | `sdkwork-search-app-api` | app | App/client SDKs for `/app/v3/api` |
| `sdkwork-search-backend-sdk` | `sdkwork-search-backend-api` | backend | Backend/admin SDKs for `/backend/v3/api` |

## Owner

`sdkwork-search` workspace maintainers.

## Allowed Content

- SDK family directories (`sdkwork-search-app-sdk/`, `sdkwork-search-backend-sdk/`)
- Route manifests (`_route-manifests/`)
- OpenAPI materialization scripts
- Generated SDK output under `<family>/generated/`

## Forbidden Content

- Hand-authored API contracts (belongs in `apis/`)
- Repository/application workspace metadata (belongs in `.sdkwork/`)
- Runtime secrets or credentials

## Related Specs

- `../sdkwork-specs/SDK_SPEC.md`
- `../sdkwork-specs/SDK_WORKSPACE_GENERATION_SPEC.md`
- `../sdkwork-specs/API_SPEC.md`

## Verification

```powershell
node .\sdks\materialize-search-v3-openapi-boundaries.mjs
.\sdks\sdkwork-search-app-sdk\bin\generate-sdk.ps1 -Languages typescript
.\sdks\sdkwork-search-backend-sdk\bin\generate-sdk.ps1 -Languages typescript
pnpm test:governance
```

## Workflow

Both families are owner-only. They generate only operations with `x-sdkwork-owner: sdkwork-search` and declare `contracts.sdkDependencies: []`.

The generation wrappers call the canonical SDKWork generator:

```text
..\sdkwork-sdk-generator\bin\sdkgen.js
```
