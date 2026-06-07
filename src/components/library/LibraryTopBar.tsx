import { useEffect } from "react";
import type { SmartViewId } from "./LibrarySidebar";

interface Props {
  search: string;
  onSearch: (next: string) => void;
  statusMessage: string;
  onClearStatus: () => void;
  onQuickCapture: () => void;
  onOpenSettings: () => void;
  smartCounts: Record<SmartViewId, number>;
  autoRoutedShare: number | null;
  failedCount: number;
  reviewCount: number;
}

export default function LibraryTopBar({
  search,
  onSearch,
  statusMessage,
  onClearStatus,
  onQuickCapture,
  onOpenSettings,
  smartCounts,
  autoRoutedShare,
  failedCount,
  reviewCount,
}: Props) {
  useEffect(() => {
    if (!statusMessage) return;
    const timer = window.setTimeout(onClearStatus, 3200);
    return () => window.clearTimeout(timer);
  }, [statusMessage, onClearStatus]);

  return (
    <header className="library-topbar">
      <div className="library-topbar-row">
        <div className="library-brand">
          <span className="library-brand-word">Klyph</span>
          <span className="library-brand-word font-serif-italic">Library</span>
        </div>

        <label className="library-search">
          <span className="library-search-icon" aria-hidden>
            ⌕
          </span>
          <input
            type="text"
            placeholder={`Search ${smartCounts.all} captures…`}
            value={search}
            onChange={(event) => onSearch(event.currentTarget.value)}
            className="library-search-input"
          />
          {search ? (
            <button
              type="button"
              className="library-search-clear"
              onClick={() => onSearch("")}
              aria-label="Clear search"
            >
              ×
            </button>
          ) : null}
        </label>

        <div className="library-topbar-actions">
          <button
            type="button"
            className="library-btn library-btn-soft"
            onClick={onOpenSettings}
          >
            Settings
          </button>
          <button
            type="button"
            className="library-btn library-btn-primary"
            onClick={onQuickCapture}
          >
            <span>New capture</span>
            <span className="library-kbd">⌘.</span>
          </button>
        </div>
      </div>

      <div className="library-stats-row">
        <Stat label="This week" value={String(smartCounts.week)} />
        <Stat
          label="Auto-routed"
          value={autoRoutedShare === null ? "—" : `${autoRoutedShare}%`}
          tone={autoRoutedShare !== null && autoRoutedShare >= 60 ? "ok" : undefined}
        />
        <Stat
          label="Pending review"
          value={String(reviewCount)}
          tone={reviewCount > 0 ? "warn" : undefined}
        />
        <Stat
          label="Sync failed"
          value={String(failedCount)}
          tone={failedCount > 0 ? "danger" : undefined}
        />
        <div className="library-stats-spacer" />
        {statusMessage ? (
          <div className="library-status-pill" role="status">
            {statusMessage}
          </div>
        ) : null}
      </div>
    </header>
  );
}

function Stat({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone?: "ok" | "warn" | "danger";
}) {
  return (
    <div className="library-stat">
      <div
        className="library-stat-value tabular"
        data-tone={tone ?? "neutral"}
      >
        {value}
      </div>
      <div className="library-stat-label">{label}</div>
    </div>
  );
}
