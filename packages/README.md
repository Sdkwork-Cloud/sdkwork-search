# packages/

Shared TypeScript packages for the `sdkwork-search` workspace.

## Purpose

Contains shared library packages consumed by multiple application roots.

## Packages

| Package | Description |
| --- | --- |
| `common/search/sdkwork-search-contracts/` | Shared search documents, catalog normalization, ranking, grouping, and query response contracts |
| `common/search/sdkwork-search-service/` | Search service facade with injected SDK clients and local catalog fallback |

## Owner

`sdkwork-search` workspace maintainers.

## Allowed Content

- Shared TypeScript/JavaScript packages
- Common contracts and service facades
- Domain-neutral utilities

## Forbidden Content

- Application-specific code (belongs in `apps/<app-root>/packages/`)
- Rust crates (belongs in `crates/`)
- Generated SDK output (belongs in `sdks/`)

## Related Specs

- `../sdkwork-specs/MODULE_SPEC.md`
- `../sdkwork-specs/TYPESCRIPT_CODE_SPEC.md`

## Verification

```powershell
pnpm test:contracts
pnpm typecheck
```
