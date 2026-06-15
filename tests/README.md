# tests/

Cross-package tests, contract tests, integration tests, end-to-end tests, fixtures, and static verification inputs.

## Purpose

Contains cross-package and integration tests for the `sdkwork-search` workspace.

## Owner

`sdkwork-search` workspace maintainers.

## Allowed Content

- Contract tests
- Integration tests
- End-to-end tests
- Test fixtures
- Static verification inputs

## Forbidden Content

- Live secrets or credentials
- Private customer data
- Runtime state

## Related Specs

- `../sdkwork-specs/TEST_SPEC.md`

## Verification

```powershell
pnpm test
cargo test --workspace
```
