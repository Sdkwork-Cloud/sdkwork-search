# apis/

Author-owned API contracts and API source inputs for all API kinds, including HTTP OpenAPI surfaces, route manifests, API examples, API changelogs, and API validation inputs.

## Purpose

This directory contains API contract sources for the `sdkwork-search` workspace.

## Owner

`sdkwork-search` workspace maintainers.

## Allowed Content

- OpenAPI specifications (`openapi.yaml`)
- Route authority contracts
- API examples and changelogs
- API validation fixtures

## Forbidden Content

- Generated SDK transport output
- Generated SDK control-plane `.sdkwork/` files
- Implementation code

## Related Specs

- `../sdkwork-specs/API_SPEC.md`
- `../sdkwork-specs/SDK_SPEC.md`
- `../sdkwork-specs/SDK_WORKSPACE_GENERATION_SPEC.md`

## Verification

API contracts in this directory feed `sdks/` for SDK generation. Generated SDK output remains under `sdks/`.
