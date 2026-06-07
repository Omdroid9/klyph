import { Component, type ErrorInfo, type ReactNode } from "react";

interface ErrorBoundaryProps {
  children: ReactNode;
  windowLabel?: string;
}

interface ErrorBoundaryState {
  error: Error | null;
}

export default class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { error: null };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error(`UI error (${this.props.windowLabel ?? "app"})`, error, info.componentStack);
  }

  render() {
    if (!this.state.error) {
      return this.props.children;
    }

    return (
      <div className="app-page flex h-full w-full items-center justify-center p-6">
        <div className="codex-surface max-w-md rounded-2xl p-5 text-sm">
          <p className="font-display mb-2 text-base font-semibold">Something went wrong</p>
          <p className="codex-muted mb-3 text-xs leading-5">
            {this.props.windowLabel ? `${this.props.windowLabel} window` : "This window"} hit a
            rendering error. You can reload or restart Klyph from the tray.
          </p>
          <p className="mb-4 break-words rounded-lg border border-red-400/30 bg-red-500/10 px-3 py-2 text-xs text-red-600 dark:text-red-300">
            {this.state.error.message}
          </p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="codex-btn rounded-lg px-4 py-2 text-xs font-semibold"
          >
            Reload window
          </button>
        </div>
      </div>
    );
  }
}
