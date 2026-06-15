# apps/

Independently runnable application roots for the `sdkwork-search` workspace.

## Purpose

Contains application surface roots for PC, H5, and Flutter mobile applications that consume search capabilities.

## Application Roots

| Root | Architecture | Description |
| --- | --- | --- |
| `sdkwork-search-pc/` | PC React | PC browser/desktop/tablet search application |
| `sdkwork-search-h5/` | H5 React | Phone-first mobile web/Capacitor search application |
| `sdkwork-search-flutter-mobile/` | Flutter | Flutter mobile search application |

## Owner

`sdkwork-search` workspace maintainers.

## Allowed Content

- Application root directories with `sdkwork.app.config.json`
- `.sdkwork/` workspace metadata per app root
- `packages/` architecture-local directories per app root
- `config/`, `scripts/`, `sdks/`, `specs/`, `tests/` per app root

## Forbidden Content

- Shared library code (belongs in root `packages/`)
- Rust crates (belongs in `crates/`)
- SDK family workspaces (belongs in root `sdks/`)

## Related Specs

- `../sdkwork-specs/SDKWORK_WORKSPACE_SPEC.md`
- `../sdkwork-specs/APP_PC_ARCHITECTURE_SPEC.md`
- `../sdkwork-specs/APP_H5_ARCHITECTURE_SPEC.md`
- `../sdkwork-specs/FLUTTER_APP_MOBILE_ARCHITECTURE_SPEC.md`
- `../sdkwork-specs/APPLICATION_SPEC.md`

## Verification

Each app root must have `AGENTS.md`, `.sdkwork/`, and `sdkwork.app.config.json`.
