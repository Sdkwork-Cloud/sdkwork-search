# SDKWork Search PC - Agent Instructions

## Application Identity

- **Code**: `sdkwork-search-pc`
- **Name**: SDKWork Search PC
- **Runtime**: PC browser/desktop/tablet
- **Framework**: React
- **Domain**: intelligence
- **Capability**: search

## Spec Resolution Order

1. This `AGENTS.md` and application-level specs.
2. `sdkwork.app.config.json` for application metadata.
3. Local `specs/` for component-level contracts.
4. `.sdkwork/` for local skills and plugins.
5. `../../sdkwork-specs/` for root standards.

## Required Specs

- `../../sdkwork-specs/APP_PC_ARCHITECTURE_SPEC.md` - PC application root architecture
- `../../sdkwork-specs/APP_PC_REACT_UI_SPEC.md` - PC React UI package rules
- `../../sdkwork-specs/APP_SDK_INTEGRATION_SPEC.md` - SDK integration rules
- `../../sdkwork-specs/UI_ARCHITECTURE_SPEC.md` - UI architecture selection
- `../../sdkwork-specs/CONFIG_SPEC.md` - Runtime configuration
- `../../sdkwork-specs/SECURITY_SPEC.md` - Security rules

## Package Structure

- `packages/sdkwork-search-pc-react/` - PC React search package

## Verification

```powershell
pnpm typecheck
pnpm test
```

## SDKWORK Soul

Read `../../sdkwork-specs/SOUL.md` before executing tasks in this root. Follow specs before memory, dictionary before context, stop on ambiguity, and evidence before completion.
