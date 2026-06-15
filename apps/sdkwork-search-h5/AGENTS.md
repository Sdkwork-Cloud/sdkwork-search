# SDKWork Search H5 - Agent Instructions

## Application Identity

- **Code**: `sdkwork-search-h5`
- **Name**: SDKWork Search H5
- **Runtime**: Phone-first H5/Capacitor
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

- `../../sdkwork-specs/APP_H5_ARCHITECTURE_SPEC.md` - H5 application root architecture
- `../../sdkwork-specs/APP_MOBILE_REACT_UI_SPEC.md` - Mobile React UI package rules
- `../../sdkwork-specs/APP_SDK_INTEGRATION_SPEC.md` - SDK integration rules
- `../../sdkwork-specs/UI_ARCHITECTURE_SPEC.md` - UI architecture selection
- `../../sdkwork-specs/CONFIG_SPEC.md` - Runtime configuration
- `../../sdkwork-specs/SECURITY_SPEC.md` - Security rules

## Package Structure

- `packages/sdkwork-search-h5-react/` - H5 React search package

## Verification

```powershell
pnpm typecheck
pnpm test
```

## SDKWORK Soul

Read `../../sdkwork-specs/SOUL.md` before executing tasks in this root. Follow specs before memory, dictionary before context, stop on ambiguity, and evidence before completion.
