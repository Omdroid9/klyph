export type CaptureTag = "work" | "personal" | "idea" | "untagged";
export type CaptureLane = "focus" | "distraction";

export interface CaptureDestinations {
  slack: boolean;
  discord: boolean;
  notion: boolean;
  googleTasks: boolean;
  googleCalendar: boolean;
  appleReminders: boolean;
  reminders: boolean;
}

export type RoutingRuleField = "tag" | "list" | "lane" | "keyword";

export interface RoutingRule {
  id: string;
  field: RoutingRuleField;
  match_value: string;
  destinations: CaptureDestinations;
  created_at?: string;
  hit_count?: number;
}

export type RoutingSource =
  | "rule"
  | "reminder-command"
  | "time-calendar"
  | "time-reminders"
  | "connected-default"
  | "notes-fallback"
  | "manual"
  | "none";

export interface RoutingDecision {
  destinations: CaptureDestinations;
  source: RoutingSource;
  reason: string;
  ruleId: string | null;
}

export interface Capture {
  id: string;
  content: string;
  tag: CaptureTag;
  capture_lane: CaptureLane;
  list_name: string;
  created_at: string;
  synced_slack: number;
  synced_discord: number;
  synced_google_tasks: number;
  synced_google_calendar: number;
  synced_notion: number;
  synced_apple_reminders: number;
  synced_reminders: number;
  target_slack: number;
  target_discord: number;
  target_notion: number;
  target_google_tasks: number;
  target_google_calendar: number;
  target_apple_reminders: number;
  target_reminders: number;
  reminder_time: string | null;
  recurrence_rule: string | null;
  recurrence_next_at: string | null;
  routing_source: string | null;
  routing_reason: string | null;
  last_sync_error?: string | null;
  agent_status?: string | null;
  agent_attempts?: number | null;
  agent_intent?: string | null;
  agent_confidence?: number | null;
  agent_action_json?: string | null;
  agent_needs_review?: number | null;
  agent_error?: string | null;
}

export type ThemeMode = "auto" | "dark" | "light";
