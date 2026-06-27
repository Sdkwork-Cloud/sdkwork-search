//! Service runtime: wraps the container with `start()` / `shutdown()` lifecycle management.

use crate::container::SearchServiceContainer;

/// Runtime wrapper around [`SearchServiceContainer`] providing lifecycle hooks.
///
/// The runtime tracks whether the services have been started and exposes
/// `start()` and `shutdown()` for hosts that need explicit lifecycle control
/// (e.g. Tauri/native hosts). The services themselves are already constructed
/// when the container is built; this struct coordinates startup/shutdown
/// signalling and is safe to clone for multi-task access.
#[derive(Clone)]
pub struct SearchServiceRuntime {
    container: SearchServiceContainer,
    started: bool,
}

impl SearchServiceRuntime {
    /// Create a new runtime wrapping the supplied container.
    pub fn new(container: SearchServiceContainer) -> Self {
        Self {
            container,
            started: false,
        }
    }

    /// Signal that the services are now active.
    ///
    /// Returns early if already started.
    pub async fn start(&mut self) -> anyhow::Result<()> {
        if self.started {
            tracing::warn!("sdkwork-search-service-host runtime already started");
            return Ok(());
        }
        tracing::info!("starting sdkwork-search-service-host runtime");
        self.started = true;
        Ok(())
    }

    /// Signal that the services should stop accepting work.
    ///
    /// Returns early if not started.
    pub async fn shutdown(&mut self) -> anyhow::Result<()> {
        if !self.started {
            tracing::warn!("sdkwork-search-service-host runtime not started");
            return Ok(());
        }
        tracing::info!("shutting down sdkwork-search-service-host runtime");
        self.started = false;
        Ok(())
    }

    /// Returns `true` if `start()` has been called and `shutdown()` has not.
    pub fn is_started(&self) -> bool {
        self.started
    }

    /// Borrow the underlying service container.
    pub fn container(&self) -> &SearchServiceContainer {
        &self.container
    }

    /// Consume the runtime and return the inner container.
    pub fn into_container(self) -> SearchServiceContainer {
        self.container
    }
}
