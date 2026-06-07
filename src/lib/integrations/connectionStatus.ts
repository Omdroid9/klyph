import { getSettings } from "../db";
import { isMacOS } from "../platform";
import type { CaptureDestinations } from "../../types";

const INTEGRATION_SETTING_KEYS = [
  "slack_webhook_url",
  "discord_webhook_url",
  "notion_token",
  "notion_page_id",
  "google_tasks_access_token",
  "google_tasks_refresh_token",
  "google_tasks_list_id",
  "google_calendar_id",
] as const;

type IntegrationSettings = Record<(typeof INTEGRATION_SETTING_KEYS)[number], string | null>;

export type { IntegrationSettings };

function hasValue(value: string | null | undefined): boolean {
  return (value?.trim() ?? "").length > 0;
}

export function providerConfigured(
  provider: "slack" | "discord" | "notion" | "google",
  settings: IntegrationSettings,
): boolean {
  switch (provider) {
    case "slack":
      return hasValue(settings.slack_webhook_url);
    case "discord":
      return hasValue(settings.discord_webhook_url);
    case "notion":
      return hasValue(settings.notion_token) && hasValue(settings.notion_page_id);
    case "google":
      return (
        hasValue(settings.google_tasks_access_token) &&
        hasValue(settings.google_tasks_list_id) &&
        hasValue(settings.google_calendar_id)
      );
    default:
      return false;
  }
}

export function destinationsFromSettings(settings: IntegrationSettings): CaptureDestinations {
  return {
    slack: providerConfigured("slack", settings),
    discord: providerConfigured("discord", settings),
    notion: providerConfigured("notion", settings),
    googleTasks: providerConfigured("google", settings),
    googleCalendar: providerConfigured("google", settings),
    appleReminders: isMacOS(),
  };
}

export async function loadIntegrationSettings(): Promise<IntegrationSettings> {
  return getSettings([...INTEGRATION_SETTING_KEYS]) as Promise<IntegrationSettings>;
}

export async function loadConnectedDestinations(): Promise<CaptureDestinations> {
  const settings = await loadIntegrationSettings();
  return destinationsFromSettings(settings);
}
