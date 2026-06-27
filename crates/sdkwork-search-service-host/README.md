# sdkwork-search-service-host

In-process service host for SDKWork Search standalone/native usage.

Provides a `SearchServiceContainer` that holds the query, indexing, recommendation,
and promotion services, plus a `SearchServiceRuntime` for lifecycle management.
No HTTP route mounting — per `RUST_CODE_SPEC.md` service host contract.

## Structure

- `src/lib.rs` - module assembly and re-exports.
- `src/container.rs` - `SearchServiceContainer` holding the four service `Arc` handles.
- `src/runtime.rs` - `SearchServiceRuntime` wrapping the container with `start()` / `shutdown()`.

## Verification

```sh
cargo check -p sdkwork-search-service-host
cargo clippy -p sdkwork-search-service-host -- -D warnings
```
