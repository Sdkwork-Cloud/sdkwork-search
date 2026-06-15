# jobs/

Job definitions, schedules, queue bindings, batch descriptors, maintenance runbooks, and non-Rust job packages.

## Purpose

Reserved for scheduled jobs, queue consumers, and batch processing definitions. Currently inactive for `sdkwork-search`.

## Owner

`sdkwork-search` workspace maintainers.

## Allowed Content

- Cron schedules
- Queue consumer bindings
- Batch job definitions
- Maintenance runbooks
- Non-Rust job packages

## Forbidden Content

- Rust worker implementations (belongs in `crates/`)
- Live secrets or credentials
- Runtime state

## Related Specs

- `../sdkwork-specs/SDKWORK_WORKSPACE_SPEC.md`

## Verification

No active jobs currently. Activate when scheduled or batch processing is needed.
