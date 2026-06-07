import { setSetting } from "../db";
import { createAppleNote } from "./appleNotes";
import type { Capture } from "../../types";
import { calendarEventId, createGoogleCalendarEvent } from "./googleCalendar";
import { sendDiscordCapture } from "./discord";
import { createGoogleTask, refreshGoogleAccessToken } from "./googleTasks";
import { appendNotionCapture } from "./notion";
import { sendSlackCapture } from "./slack";

export interface SyncConfig {
  slackWebhookUrl?: string;
  discordWebhookUrl?: string;
  notionToken?: string;
  notionPageId?: string;
  googleTasksAccessToken?: string;
  googleTasksRefreshToken?: string;
  googleTasksListId?: string;
  googleCalendarId?: string;
  integrationBackendUrl?: string;
  // Apple Notes writes happen natively (AppleScript) on macOS only. No bridge.
  appleNotesEnabled?: boolean;
  appleNotesFolder?: string;
}

export interface SyncResult {
  slackSynced: boolean;
  discordSynced: boolean;
  notionSynced: boolean;
  googleSynced: boolean;
  googleCalendarSynced: boolean;
  appleRemindersSynced: boolean;
  errors: string[];
}

interface RetryOutcome {
  ok: boolean;
  error: string | null;
}

function backoffMs(attempt: number): number {
  return Math.min(1_000 * 2 ** attempt, 10_000);
}

function toErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

async function runWithRetry(task: () => Promise<void>): Promise<RetryOutcome> {
  let lastError: unknown = null;
  for (let attempt = 0; attempt < 3; attempt += 1) {
    try {
      await task();
      return { ok: true, error: null };
    } catch (error) {
      lastError = error;
      if (attempt === 2) {
        console.error("Sync task failed after max retries", error);
        return { ok: false, error: toErrorMessage(error) };
      }
      await new Promise((resolve) => {
        setTimeout(resolve, backoffMs(attempt));
      });
    }
  }
  return { ok: false, error: lastError ? toErrorMessage(lastError) : "Unknown sync error" };
}

function shouldSyncSlack(capture: Capture, config: SyncConfig): boolean {
  return Boolean(config.slackWebhookUrl && capture.target_slack === 1 && capture.synced_slack === 0);
}

function shouldSyncDiscord(capture: Capture, config: SyncConfig): boolean {
  return Boolean(config.discordWebhookUrl && capture.target_discord === 1 && capture.synced_discord === 0);
}

function shouldSyncNotion(capture: Capture, config: SyncConfig): boolean {
  return Boolean(
    config.notionToken &&
      config.notionPageId &&
      capture.target_notion === 1 &&
      capture.synced_notion === 0,
  );
}

function shouldSyncGoogle(capture: Capture, config: SyncConfig): boolean {
  return Boolean(
    config.googleTasksAccessToken &&
      config.googleTasksListId &&
      capture.target_google_tasks === 1 &&
      capture.synced_google_tasks === 0,
  );
}

function shouldSyncGoogleCalendar(capture: Capture, config: SyncConfig): boolean {
  return Boolean(
    config.googleTasksAccessToken &&
      config.googleCalendarId &&
      capture.target_google_calendar === 1 &&
      capture.synced_google_calendar === 0 &&
      // Only create a calendar event when the capture has an actual time.
      // Otherwise every untimed note becomes a "now + 30 min" event.
      capture.reminder_time,
  );
}

function appleNoteTitle(content: string): string {
  const firstLine = content.split("\n")[0]?.trim() ?? "";
  const normalized = firstLine.length > 0 ? firstLine : content.trim();
  if (normalized.length === 0) {
    return "Klyph";
  }
  return normalized.slice(0, 80);
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function appleNoteBody(capture: Capture): string {
  const paragraphs = capture.content
    .split("\n")
    .map((line) => `<div>${escapeHtml(line) || "<br>"}</div>`)
    .join("");
  const footer = `<div><br></div><div><i>${escapeHtml(capture.list_name)} • ${escapeHtml(capture.tag)}</i></div>`;
  return `${paragraphs}${footer}`;
}

function shouldSyncAppleReminders(capture: Capture, config: SyncConfig): boolean {
  return Boolean(
    config.appleNotesEnabled &&
      capture.target_apple_reminders === 1 &&
      capture.synced_apple_reminders === 0,
  );
}

export function requiresSync(capture: Capture, config: SyncConfig): boolean {
  return (
    shouldSyncSlack(capture, config) ||
    shouldSyncDiscord(capture, config) ||
    shouldSyncNotion(capture, config) ||
    shouldSyncGoogle(capture, config) ||
    shouldSyncGoogleCalendar(capture, config) ||
    shouldSyncAppleReminders(capture, config)
  );
}

function isUnauthorizedError(error: unknown): boolean {
  if (!(error instanceof Error)) {
    return false;
  }
  return error.message.includes("HTTP 401");
}

async function syncGoogleCapture(capture: Capture, config: SyncConfig): Promise<void> {
  const createTask = async (accessToken: string) => {
    await createGoogleTask({
      accessToken,
      listId: config.googleTasksListId!,
      title: capture.content,
      notes: `Klyph list: ${capture.list_name}`,
      due: capture.reminder_time ?? undefined,
    });
  };

  try {
    await createTask(config.googleTasksAccessToken!);
    return;
  } catch (error) {
    if (
      !isUnauthorizedError(error) ||
      !config.googleTasksRefreshToken ||
      !config.integrationBackendUrl
    ) {
      throw error;
    }
  }

  const refreshedAccessToken = await refreshGoogleAccessToken(
    config.integrationBackendUrl,
    config.googleTasksRefreshToken,
  );

  await setSetting("google_tasks_access_token", refreshedAccessToken);
  config.googleTasksAccessToken = refreshedAccessToken;

  await createTask(refreshedAccessToken);
}

async function syncGoogleCalendarCapture(capture: Capture, config: SyncConfig): Promise<void> {
  const createEvent = async (accessToken: string) => {
    await createGoogleCalendarEvent({
      accessToken,
      calendarId: config.googleCalendarId!,
      summary: capture.content,
      description: `Klyph list: ${capture.list_name}\nTag: ${capture.tag}`,
      reminderTime: capture.reminder_time,
      eventId: calendarEventId(capture.id),
    });
  };

  try {
    await createEvent(config.googleTasksAccessToken!);
    return;
  } catch (error) {
    if (
      !isUnauthorizedError(error) ||
      !config.googleTasksRefreshToken ||
      !config.integrationBackendUrl
    ) {
      throw error;
    }
  }

  const refreshedAccessToken = await refreshGoogleAccessToken(
    config.integrationBackendUrl,
    config.googleTasksRefreshToken,
  );

  await setSetting("google_tasks_access_token", refreshedAccessToken);
  config.googleTasksAccessToken = refreshedAccessToken;

  await createEvent(refreshedAccessToken);
}

export async function syncCapture(capture: Capture, config: SyncConfig): Promise<SyncResult> {
  const errors: string[] = [];

  async function attempt(label: string, task: () => Promise<void>): Promise<boolean> {
    const outcome = await runWithRetry(task);
    if (!outcome.ok && outcome.error) {
      errors.push(`${label}: ${outcome.error}`);
    }
    return outcome.ok;
  }

  const slackSynced = shouldSyncSlack(capture, config)
    ? await attempt("Slack", () =>
        sendSlackCapture(config.slackWebhookUrl!, capture.content, capture.tag, capture.list_name),
      )
    : false;

  const discordSynced = shouldSyncDiscord(capture, config)
    ? await attempt("Discord", () =>
        sendDiscordCapture(config.discordWebhookUrl!, capture.content, capture.tag, capture.list_name),
      )
    : false;

  const notionSynced = shouldSyncNotion(capture, config)
    ? await attempt("Notion", () =>
        appendNotionCapture({
          token: config.notionToken!,
          pageId: config.notionPageId!,
          content: capture.content,
          tag: capture.tag,
          listName: capture.list_name,
        }),
      )
    : false;

  const googleSynced = shouldSyncGoogle(capture, config)
    ? await attempt("Google Tasks", () => syncGoogleCapture(capture, config))
    : false;

  const googleCalendarSynced = shouldSyncGoogleCalendar(capture, config)
    ? await attempt("Google Calendar", () => syncGoogleCalendarCapture(capture, config))
    : false;

  const appleRemindersSynced = shouldSyncAppleReminders(capture, config)
    ? await attempt("Apple Notes", () =>
        createAppleNote({
          title: appleNoteTitle(capture.content),
          body: appleNoteBody(capture),
          folder: config.appleNotesFolder,
        }),
      )
    : false;

  return {
    slackSynced,
    discordSynced,
    notionSynced,
    googleSynced,
    googleCalendarSynced,
    appleRemindersSynced,
    errors,
  };
}
