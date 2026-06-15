# SDKWork Search Flutter Mobile - Agent Instructions

## Application Identity

- **Code**: `sdkwork-search-flutter-mobile`
- **Name**: SDKWork Search Flutter Mobile
- **Runtime**: Flutter mobile (iOS/Android)
- **Framework**: Flutter/Dart
- **Domain**: intelligence
- **Capability**: search

## Spec Resolution Order

1. This `AGENTS.md` and application-level specs.
2. `sdkwork.app.config.json` for application metadata.
3. Local `specs/` for component-level contracts.
4. `.sdkwork/` for local skills and plugins.
5. `../../sdkwork-specs/` for root standards.

## Required Specs

- `../../sdkwork-specs/FLUTTER_APP_MOBILE_ARCHITECTURE_SPEC.md` - Flutter mobile root architecture
- `../../sdkwork-specs/APP_FLUTTER_UI_SPEC.md` - Flutter UI package rules
- `../../sdkwork-specs/APP_SDK_INTEGRATION_SPEC.md` - SDK integration rules
- `../../sdkwork-specs/UI_ARCHITECTURE_SPEC.md` - UI architecture selection
- `../../sdkwork-specs/CONFIG_SPEC.md` - Runtime configuration
- `../../sdkwork-specs/SECURITY_SPEC.md` - Security rules

## Package Structure

- `packages/sdkwork_search_flutter_mobile_core/` - Core runtime config and SDK factories
- `packages/sdkwork_search_flutter_mobile_commons/` - Domain-neutral widgets and design tokens
- `packages/sdkwork_search_flutter_mobile_shell/` - App shell and route assembly
- `packages/sdkwork_search_flutter_mobile_search/` - Search capability screens and services

## Verification

```powershell
flutter analyze
flutter test
```

## SDKWORK Soul

Read `../../sdkwork-specs/SOUL.md` before executing tasks in this root. Follow specs before memory, dictionary before context, stop on ambiguity, and evidence before completion.
