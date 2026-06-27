//! Graceful shutdown signal coordination.
//!
//! `sdkwork_web_bootstrap::serve` already installs Ctrl+C / SIGTERM graceful
//! shutdown internally. This module exposes the raw signal waiter for callers
//! that need custom shutdown sequencing outside the standard serve path.

/// Wait for an OS shutdown signal (Ctrl+C or SIGTERM on Unix).
pub async fn wait_for_shutdown_signal() {
    let ctrl_c = async {
        tokio::signal::ctrl_c()
            .await
            .expect("failed to install Ctrl+C handler");
    };

    #[cfg(unix)]
    let terminate = async {
        tokio::signal::unix::signal(tokio::signal::unix::SignalKind::terminate())
            .expect("failed to install SIGTERM handler")
            .recv()
            .await;
    };

    #[cfg(not(unix))]
    let terminate = std::future::pending::<()>();

    tokio::select! {
        _ = ctrl_c => {},
        _ = terminate => {},
    }
}
