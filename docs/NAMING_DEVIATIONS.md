# Naming Deviations

This document records naming deviations from `sdkwork-specs/NAMING_SPEC.md` in the `sdkwork-search` workspace.

## Package Naming Deviations

### PC React Package

- **Current**: `@sdkwork/search-pc-react`
- **Standard**: `sdkwork-search-pc-search`
- **Reason**: Uses `-react` suffix to indicate framework/architecture, consistent with existing project convention
- **Impact**: Low - scoped npm package name, internal use only

### H5 React Package

- **Current**: `@sdkwork/search-h5-react`
- **Standard**: `sdkwork-search-h5-search`
- **Reason**: Uses `-react` suffix to indicate framework/architecture, consistent with existing project convention
- **Impact**: Low - scoped npm package name, internal use only

## Rust Crate Naming Deviations

### Route Crates

- **Current**: `sdkwork-routes-search-app-api`, `sdkwork-routes-search-backend-api`
- **Standard**: `sdkwork-router-search-app-api`, `sdkwork-router-search-backend-api`
- **Reason**: Uses `routes` plural instead of `router` singular
- **Impact**: Low - internal crate names, no external consumers

### Storage Crate

- **Current**: `sdkwork-search-storage-sqlx-rust`
- **Standard**: `sdkwork-search-repository-sqlx`
- **Reason**: Uses `storage` instead of `repository`, includes `-rust` suffix
- **Impact**: Low - internal crate name, no external consumers

## Decision

These deviations are accepted as they represent existing naming conventions in the project. Changing them would require:
1. Updating all Cargo.toml files
2. Updating all import paths
3. Updating all test references
4. Updating governance tests

The cost of renaming outweighs the benefit of strict naming compliance for internal components.

## Future Considerations

If external consumers are added or if these components are published, consider:
1. Creating aliases with standard names
2. Deprecating old names gradually
3. Following standard naming for new components
