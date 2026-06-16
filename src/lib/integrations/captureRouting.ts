import type { CaptureDestinations } from "../../types";
import { isMacOS } from "../platform";
import { providerConfigured, type IntegrationSettings } from "./connectionStatus";

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
