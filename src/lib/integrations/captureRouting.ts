import type {
  CaptureDestinations,
  CaptureLane,
  CaptureTag,
  RoutingDecision,
  RoutingRule,
} from "../../types";
import { classifyIntent } from "../intent";
import { isMacOS } from "../platform";
import { destinationsFromSettings, providerConfigured, type IntegrationSettings } from "./connectionStatus";

export function hasActiveDestination(destinations: CaptureDestinations): boolean {
  return Object.values(destinations).some(Boolean);
}

export function hasAnyProviderConfigured(settings: IntegrationSettings): boolean {
  return (
    providerConfigured("slack", settings) ||
    providerConfigured("discord", settings) ||
    providerConfigured("notion", settings) ||
    providerConfigured("google", settings) ||
    isMacOS()
  );
}

export function availableDestinations(settings: IntegrationSettings): CaptureDestinations {
  const googleReady = providerConfigured("google", settings);
  const onMac = isMacOS();
  return {
    slack: providerConfigured("slack", settings),
    discord: providerConfigured("discord", settings),
    notion: providerConfigured("notion", settings),
    googleTasks: googleReady,
    googleCalendar: googleReady,
    appleReminders: onMac,
    reminders: onMac,
  };
}

/** Apply routing rules before save (timed captures → Google Calendar when connected). */
export function applySmartCaptureDestinations(
  destinations: CaptureDestinations,
  reminderTime: string | null,
  settings: IntegrationSettings,
): CaptureDestinations {
  const next = { ...destinations };

  if (reminderTime && providerConfigured("google", settings)) {
    next.googleCalendar = true;
  }

  return next;
}

/** Defaults shown in the destination picker when nothing is selected. */
export function suggestedCaptureDestinations(
  reminderTime: string | null,
  settings: IntegrationSettings,
): CaptureDestinations {
  const available = availableDestinations(settings);
  const next: CaptureDestinations = {
    slack: false,
    discord: false,
    notion: false,
    googleTasks: false,
    googleCalendar: false,
    appleReminders: false,
    reminders: false,
  };

  if (reminderTime && available.googleCalendar) {
    next.googleCalendar = true;
    return next;
  }

  // Timed captures with no Google Calendar → Reminders (has native due-date support)
  if (reminderTime && available.reminders) {
    next.reminders = true;
    return next;
  }

  if (available.slack) {
    next.slack = true;
  } else if (available.notion) {
    next.notion = true;
  } else if (available.googleTasks) {
    next.googleTasks = true;
  } else if (available.appleReminders) {
    // Apple Notes is always available on macOS with no setup — use it as the
    // last-resort fallback so captures never silently go nowhere on Mac.
    next.appleReminders = true;
  }

  return next;
}

const DESTINATION_NAMES: Record<keyof CaptureDestinations, string> = {
  slack: "Slack",
  discord: "Discord",
  notion: "Notion",
  googleTasks: "Google Tasks",
  googleCalendar: "Google Calendar",
  appleReminders: "Apple Notes",
  reminders: "Reminders",
};

const EMPTY_DESTINATIONS: CaptureDestinations = {
  slack: false,
  discord: false,
  notion: false,
  googleTasks: false,
  googleCalendar: false,
  appleReminders: false,
  reminders: false,
};

export interface RoutingInput {
  text: string;
  tag: CaptureTag;
  lane: CaptureLane;
  listName: string;
  reminderTime: string | null;
  isReminderCommand: boolean;
  settings: IntegrationSettings;
  rules: RoutingRule[];
}

export function destinationNames(destinations: CaptureDestinations): string[] {
  return (Object.keys(DESTINATION_NAMES) as Array<keyof CaptureDestinations>)
    .filter((key) => destinations[key])
    .map((key) => DESTINATION_NAMES[key]);
}

export function sameDestinations(a: CaptureDestinations, b: CaptureDestinations): boolean {
  return (Object.keys(DESTINATION_NAMES) as Array<keyof CaptureDestinations>).every(
    (key) => a[key] === b[key],
  );
}

export function describeRuleCondition(rule: Pick<RoutingRule, "field" | "match_value">): string {
  switch (rule.field) {
    case "tag":
      return `#${rule.match_value}`;
    case "list":
      return `list "${rule.match_value}"`;
    case "lane":
      return rule.match_value === "distraction" ? "Distraction lane" : "Focus lane";
    case "keyword":
      return `"${rule.match_value}"`;
  }
}

export function describeRule(rule: RoutingRule): string {
  const targets = destinationNames(rule.destinations);
  return `${describeRuleCondition(rule)} → ${targets.length > 0 ? targets.join(", ") : "nowhere"}`;
}

export function ruleMatches(
  rule: RoutingRule,
  input: Pick<RoutingInput, "text" | "tag" | "lane" | "listName">,
): boolean {
  const value = rule.match_value.trim().toLowerCase();
  switch (rule.field) {
    case "tag":
      return input.tag.toLowerCase() === value;
    case "list":
      return input.listName.trim().toLowerCase() === value;
    case "lane":
      return input.lane.toLowerCase() === value;
    case "keyword":
      return value.length > 0 && input.text.toLowerCase().includes(value);
    default:
      return false;
  }
}

function intersectAvailable(
  destinations: CaptureDestinations,
  available: CaptureDestinations,
): CaptureDestinations {
  const next = { ...EMPTY_DESTINATIONS };
  for (const key of Object.keys(next) as Array<keyof CaptureDestinations>) {
    next[key] = destinations[key] && available[key];
  }
  return next;
}

/**
 * Single source of truth for "where should this capture go and why".
 * Precedence: user rules → reminder command → timed-capture heuristics →
 * all-connected default → Apple Notes fallback. Every branch carries a
 * human-readable reason so the UI can always answer "why there?".
 */
export function evaluateRouting(input: RoutingInput): RoutingDecision {
  const available = availableDestinations(input.settings);

  for (const rule of input.rules) {
    if (!ruleMatches(rule, input)) {
      continue;
    }
    const destinations = intersectAvailable(rule.destinations, available);
    if (!hasActiveDestination(destinations)) {
      // Rule targets nothing that is currently connected — fall through so
      // captures never silently route nowhere because of a stale rule.
      continue;
    }
    return {
      destinations,
      source: "rule",
      reason: `Your rule: ${describeRuleCondition(rule)} → ${destinationNames(destinations).join(", ")}`,
      ruleId: rule.id,
    };
  }

  // Reminders is deliberately excluded from the default spray: a task app is
  // only the right home when a signal says so (a time, a "remind me…", task
  // intent, a rule, or the user's own toggle). Random thoughts must not pile
  // up as dateless reminders. Branches below re-enable it explicitly.
  const connected = {
    ...intersectAvailable(destinationsFromSettings(input.settings), available),
    reminders: false,
  };

  if (input.isReminderCommand && input.reminderTime && available.reminders) {
    const onlyAppleNotes = connected.appleReminders && !hasAnyRemote(connected);
    const destinations: CaptureDestinations = {
      ...connected,
      appleReminders: onlyAppleNotes ? false : connected.appleReminders,
      reminders: true,
    };
    return {
      destinations,
      source: "reminder-command",
      reason: "Sounds like a reminder → Reminders",
      ruleId: null,
    };
  }

  if (input.reminderTime && available.googleCalendar) {
    return {
      destinations: { ...connected, googleCalendar: true },
      source: "time-calendar",
      reason: "Has a time → Google Calendar",
      ruleId: null,
    };
  }

  if (input.reminderTime && available.reminders) {
    return {
      destinations: { ...connected, reminders: true },
      source: "time-reminders",
      reason: "Has a time → Reminders",
      ruleId: null,
    };
  }

  // Untimed captures: task-shaped content belongs in a task app, not the
  // Apple Notes graveyard — and vice versa. "unsure" falls through untouched.
  const intent = classifyIntent(input.text);

  if (intent.intent === "task") {
    if (available.reminders) {
      return {
        destinations: { ...connected, appleReminders: false, reminders: true },
        source: "intent-task",
        reason: `Looks like a to-do (${intent.signal}) → Reminders`,
        ruleId: null,
      };
    }
    if (available.googleTasks) {
      return {
        destinations: { ...connected, googleTasks: true },
        source: "intent-task",
        reason: `Looks like a to-do (${intent.signal}) → Google Tasks`,
        ruleId: null,
      };
    }
  }

  if (intent.intent === "note" && available.appleReminders) {
    return {
      destinations: { ...connected, appleReminders: true, reminders: false },
      source: "intent-note",
      reason: `Looks like a note (${intent.signal}) → Apple Notes`,
      ruleId: null,
    };
  }

  if (hasRemoteProvider(connected)) {
    return {
      destinations: connected,
      source: "connected-default",
      reason: "Your connected apps (default)",
      ruleId: null,
    };
  }

  if (hasActiveDestination(connected)) {
    return {
      destinations: connected,
      source: "notes-fallback",
      reason: "Apple Notes — nothing else is connected",
      ruleId: null,
    };
  }

  return {
    destinations: { ...EMPTY_DESTINATIONS },
    source: "none",
    reason: "Nothing connected — saved locally",
    ruleId: null,
  };
}

/** Anything besides local Apple Notes (used to drop Notes when a capture is clearly a reminder). */
function hasAnyRemote(destinations: CaptureDestinations): boolean {
  return (
    destinations.slack ||
    destinations.discord ||
    destinations.notion ||
    destinations.googleTasks ||
    destinations.googleCalendar ||
    destinations.reminders
  );
}

/** True when at least one actual third-party provider is targeted (not the local macOS apps). */
function hasRemoteProvider(destinations: CaptureDestinations): boolean {
  return (
    destinations.slack ||
    destinations.discord ||
    destinations.notion ||
    destinations.googleTasks ||
    destinations.googleCalendar
  );
}
