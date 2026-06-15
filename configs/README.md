# configs/

Source-controlled safe config templates, profile examples, config schemas, and non-secret runtime defaults.

## Purpose

Contains configuration templates for the `sdkwork-search` workspace applications.

## Owner

`sdkwork-search` workspace maintainers.

## Allowed Content

- Config templates (`.example.json`, `.example.toml`)
- Config schemas
- Profile examples
- Non-secret runtime defaults

## Forbidden Content

- Live secrets or credentials
- Runtime user/private config
- Host-local override files

## Related Specs

- `../sdkwork-specs/CONFIG_SPEC.md`
- `../sdkwork-specs/ENVIRONMENT_SPEC.md`
- `../sdkwork-specs/RUNTIME_DIRECTORY_SPEC.md`

## Verification

No secrets or live credentials should exist in this directory.
