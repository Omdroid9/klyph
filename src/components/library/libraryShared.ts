import type { Capture } from "../../types";

export type Destination =
  | "slack"
  | "notion"
  | "googleCalendar"
  | "googleTasks"
  | "appleReminders"
  | "discord";

export type SyncStatus = "synced" | "queued" | "failed" | "off";

export const DESTINATIONS: Destination[] = [
  "slack",
  "notion",
  "googleCalendar",
  "googleTasks",
  "appleReminders",
  "discord",
];

export function destinationLabel(dest: Destination): string {
  switch (dest) {
    case "slack":
      return "Slack";
    case "notion":
      return "Notion";
    case "googleCalendar":
      return "Calendar";
    case "googleTasks":
      return "Tasks";
    case "appleReminders":
      return "Reminders";
    case "discord":
      return "Discord";
  }
}

function targeted(capture: Capture, dest: Destination): boolean {
  switch (dest) {
    case "slack":
      return Boolean(capture.target_slack);
    case "notion":
      return Boolean(capture.target_notion);
    case "googleCalendar":
      return Boolean(capture.target_google_calendar);
    case "googleTasks":
      return Boolean(capture.target_google_tasks);
    case "appleReminders":
      return Boolean(capture.target_apple_reminders);
    case "discord":
      return Boolean(capture.target_discord);
  }
}

function synced(capture: Capture, dest: Destination): boolean {
  switch (dest) {
    case "slack":
      return Boolean(capture.synced_slack);
    case "notion":
      return Boolean(capture.synced_notion);
    case "googleCalendar":
      return Boolean(capture.synced_google_calendar);
    case "googleTasks":
      return Boolean(capture.synced_google_tasks);
    case "appleReminders":
      return Boolean(capture.synced_apple_reminders);
    case "discord":
      return Boolean(capture.synced_discord);
  }
}

export function syncStatusFor(capture: Capture, dest: Destination): SyncStatus {
  if (!targeted(capture, dest)) return "off";
  if (synced(capture, dest)) return "synced";
  if (capture.last_sync_error) return "failed";
  return "queued";
}

export function formatRelative(iso: string): string {
  const ts = Date.parse(iso);
  if (!Number.isFinite(ts)) return iso;
  const deltaMs = Date.now() - ts;
  const minutes = Math.round(deltaMs / 60_000);
  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(ts).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
}

export interface AgentSummary {
  intent: string | null;
  confidence: number | null;
  reasoning: string | null;
  actions: string[];
}

export function parseAgentAction(capture: Capture | null): AgentSummary {
  if (!capture) {
    return { intent: null, confidence: null, reasoning: null, actions: [] };
  }
  const intent =
    capture.agent_intent && capture.agent_intent.trim().length > 0
      ? capture.agent_intent
      : null;
  const confidence =
    typeof capture.agent_confidence === "number" &&
    Number.isFinite(capture.agent_confidence)
      ? capture.agent_confidence
      : null;

  let reasoning: string | null = null;
  const actions: string[] = [];

  const raw = capture.agent_action_json?.trim();
  if (raw) {
    try {
      const parsed = JSON.parse(raw) as {
        reasoning?: string;
        rationale?: string;
        explanation?: string;
        actions?: Array<{ label?: string; type?: string; target?: string } | string>;
      };
      reasoning =
        parsed.reasoning ?? parsed.rationale ?? parsed.explanation ?? null;
      if (Array.isArray(parsed.actions)) {
        for (const action of parsed.actions) {
          if (typeof action === "string") {
            actions.push(action);
          } else if (action && typeof action === "object") {
            const bits = [action.label, action.type, action.target].filter(
              (v): v is string => typeof v === "string" && v.length > 0,
            );
            if (bits.length > 0) {
              actions.push(bits.join(" · "));
            }
          }
        }
      }
    } catch {
      // ignore malformed payload; fall through to other reasoning sources
    }
  }

  if (!reasoning && capture.agent_error) {
    reasoning = capture.agent_error;
  }

  return { intent, confidence, reasoning, actions };
}
