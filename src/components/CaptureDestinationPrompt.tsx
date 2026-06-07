import { useEffect, useState } from "react";
import type { CaptureDestinations } from "../types";

const DESTINATION_META: Array<{
  key: keyof CaptureDestinations;
  label: string;
}> = [
  { key: "googleCalendar", label: "Google Calendar" },
  { key: "googleTasks", label: "Google Tasks" },
  { key: "slack", label: "Slack" },
  { key: "notion", label: "Notion" },
  { key: "discord", label: "Discord" },
  { key: "appleReminders", label: "Apple Notes" },
];

interface CaptureDestinationPromptProps {
  reminderLabel: string | null;
  destinations: CaptureDestinations;
  available: CaptureDestinations;
  onConfirm: (destinations: CaptureDestinations) => void;
  onLocalOnly: () => void;
  onCancel: () => void;
}

export default function CaptureDestinationPrompt({
  reminderLabel,
  destinations,
  available,
  onConfirm,
  onLocalOnly,
  onCancel,
}: CaptureDestinationPromptProps) {
  const [draft, setDraft] = useState(destinations);

  useEffect(() => {
    setDraft(destinations);
  }, [destinations]);

  const visibleOptions = DESTINATION_META.filter((item) => available[item.key]);

  return (
    <div className="capture-prompt-root" role="dialog" aria-modal="true" aria-label="Choose destinations">
      <button type="button" className="capture-prompt-backdrop" aria-label="Cancel" onClick={onCancel} />
      <div className="capture-prompt-card codex-surface">
        <h3 className="text-sm font-semibold tracking-tight">Where should this go?</h3>
        <p className="codex-muted mt-1.5 text-xs leading-5">
          {reminderLabel
            ? `Timed reminder detected (${reminderLabel}). Google Calendar is recommended.`
            : "No destination is selected. Pick at least one app, or save locally only."}
        </p>

        <div className="mt-3 flex flex-wrap gap-1.5">
          {visibleOptions.map((item) => {
            const active = draft[item.key];
            return (
              <button
                key={item.key}
                type="button"
                onClick={() =>
                  setDraft((prev) => ({
                    ...prev,
                    [item.key]: !prev[item.key],
                  }))
                }
                className={[
                  "rounded-full border px-2.5 py-1 text-[11px] transition",
                  active ? "codex-chip-active" : "codex-chip",
                ].join(" ")}
              >
                {item.label}
              </button>
            );
          })}
        </div>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
          <button
            type="button"
            onClick={onLocalOnly}
            className="codex-muted text-xs underline-offset-2 hover:underline"
          >
            Save locally only
          </button>
          <div className="flex gap-2">
            <button type="button" onClick={onCancel} className="codex-btn-soft rounded-lg px-3 py-1.5 text-xs">
              Back
            </button>
            <button
              type="button"
              disabled={!Object.values(draft).some(Boolean)}
              onClick={() => onConfirm(draft)}
              className="codex-btn rounded-lg px-3 py-1.5 text-xs font-semibold disabled:cursor-not-allowed disabled:opacity-50"
            >
              Send
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
