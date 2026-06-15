# scripts/

Thin command entrypoints for build, verification, generation, migration, packaging, and release workflows.

## Purpose

Contains build and verification entrypoint scripts for the `sdkwork-search` workspace.

## Owner

`sdkwork-search` workspace maintainers.

## Allowed Content

- Shell scripts (`.sh`, `.ps1`)
- Node scripts (`.mjs`, `.js`)
- Python scripts (`.py`)
- Build entrypoints
- Verification entrypoints
- Generation entrypoints

## Forbidden Content

- Reusable logic (belongs in `tools/` or proper packages)
- Generated SDK output
- Live secrets or credentials

## Related Specs

- `../sdkwork-specs/SDKWORK_WORKSPACE_SPEC.md`

## Verification

Scripts should be thin entrypoints that delegate to proper tools or packages.
