import { parseDate } from "chrono-node";
import {
  getCaptureById,
  getSetting,
  getSettings,
  listPendingAgentCaptures,
  setCaptureListName,
  setCaptureReminder,
  setSetting,
  updateAgentJob,
} from "../db";
import { parseReminderSyntax } from "../parser";
import { httpPostJson } from "../net/http";
import type { Capture } from "../../types";

const AGENT_SETTINGS_KEYS = [
  "agent_enabled",
  "openai_api_key",
  "agent_auto_apply_threshold",
  "agent_daily_llm_limit",
] as const;

const MODEL = "gpt-4o-mini";
const MAX_RETRIES = 3;
const RULE_BASED_AUTO_CONFIDENCE = 0.9;
const DEFAULT_THRESHOLD = 0.88;
const DEFAULT_DAILY_LLM_LIMIT = 200;
const LLM_USAGE_SETTING_KEY = "agent_llm_usage";

interface LlmBudget {
  used: number;
  limit: number;
}

type AgentIntent = "calendar" | "reminder" | "task" | "note" | "distraction";
const DISTRACTION_LIST_NAME = "Parking Lot";

type AgentAction =
  | {
      kind: "set_reminder";
      reminderTime: string;
      source: "rule" | "llm";
    }
  | {
      kind: "set_list";
      listName: string;
      source: "rule" | "llm";
    };

interface AgentDecision {
  intent: AgentIntent;
  confidence: number;
  action: AgentAction | null;
  needsReview: boolean;
}

interface AgentSettings {
  enabled: boolean;
  openAiApiKey: string;
  autoApplyThreshold: number;
  dailyLlmLimit: number;
}

interface OpenAiClassificationResponse {
  choices?: Array<{
    message?: {
      content?: string;
    };
  }>;
}

export interface AgentPassStats {
  processed: number;
  autoApplied: number;
  needsReview: number;
  failed: number;
}

let runningPass: Promise<AgentPassStats> | null = null;

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function parseThreshold(value: string | null): number {
  const numeric = Number.parseFloat(value ?? "");
  if (Number.isNaN(numeric)) {
    return DEFAULT_THRESHOLD;
  }
  return clamp(numeric, 0.5, 0.99);
}

function parseDailyLimit(value: string | null): number {
  const numeric = Number.parseInt(value ?? "", 10);
  if (Number.isNaN(numeric) || numeric < 0) {
    return DEFAULT_DAILY_LLM_LIMIT;
  }
  return numeric;
}

function todayKey(now = new Date()): string {
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(
    now.getDate(),
  ).padStart(2, "0")}`;
}

export async function getLlmUsageToday(): Promise<number> {
  const raw = await getSetting(LLM_USAGE_SETTING_KEY);
  if (!raw) {
    return 0;
  }
  try {
    const parsed = JSON.parse(raw) as { date?: string; count?: number };
    if (parsed.date === todayKey() && typeof parsed.count === "number") {
      return parsed.count;
    }
  } catch {
    return 0;
  }
  return 0;
}

async function recordLlmCall(budget: LlmBudget): Promise<void> {
  budget.used += 1;
  await setSetting(LLM_USAGE_SETTING_KEY, JSON.stringify({ date: todayKey(), count: budget.used }));
}

function parseAgentAction(value: string | null | undefined): AgentAction | null {
  if (!value) {
    return null;
  }
  try {
    const parsed = JSON.parse(value) as Partial<AgentAction>;
    if (parsed.kind === "set_reminder" && typeof parsed.reminderTime === "string") {
      return {
        kind: "set_reminder",
        reminderTime: parsed.reminderTime,
        source: parsed.source === "llm" ? "llm" : "rule",
      };
    }
    if (parsed.kind === "set_list" && typeof parsed.listName === "string") {
      return {
        kind: "set_list",
        listName: parsed.listName,
        source: parsed.source === "llm" ? "llm" : "rule",
      };
    }
    return null;
  } catch {
    return null;
  }
}

function containsCalendarIntent(text: string): boolean {
  return /\b(schedule|book|add|create|plan|set up)\b/i.test(text) &&
    /\b(calendar|meeting|event|call)\b/i.test(text);
}

function containsTaskIntent(text: string): boolean {
  return /\b(todo|to do|task|remember to|need to|i should)\b/i.test(text);
}

function containsDistractionIntent(text: string): boolean {
  return /\b(later|park this|parking lot|random thought|not now|distract)\b/i.test(text);
}

function toLocalIso(input: Date): string {
  const timezoneOffset = input.getTimezoneOffset() * 60_000;
  return new Date(input.getTime() - timezoneOffset).toISOString().slice(0, 19);
}

function extractJsonObject(text: string): string | null {
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start < 0 || end <= start) {
    return null;
  }
  return text.slice(start, end + 1);
}

async function loadAgentSettings(): Promise<AgentSettings> {
  const values = await getSettings([...AGENT_SETTINGS_KEYS]);
  return {
    enabled: (values.agent_enabled ?? "true") !== "false",
    openAiApiKey: values.openai_api_key?.trim() ?? "",
    autoApplyThreshold: parseThreshold(values.agent_auto_apply_threshold),
    dailyLlmLimit: parseDailyLimit(values.agent_daily_llm_limit),
  };
}

function ruleBasedDecision(content: string): AgentDecision {
  const reminder = parseReminderSyntax(content);
  if (reminder.reminderTime) {
    return {
      intent: "reminder",
      confidence: 0.98,
      action: {
        kind: "set_reminder",
        reminderTime: reminder.reminderTime,
        source: "rule",
      },
      needsReview: false,
    };
  }

  if (containsCalendarIntent(content)) {
    const parsedDate = parseDate(content, new Date(), { forwardDate: true });
    if (parsedDate) {
      return {
        intent: "calendar",
        confidence: RULE_BASED_AUTO_CONFIDENCE,
        action: {
          kind: "set_reminder",
          reminderTime: toLocalIso(parsedDate),
          source: "rule",
        },
        needsReview: true,
      };
    }
  }

  if (containsTaskIntent(content)) {
    return {
      intent: "task",
      confidence: 0.74,
      action: null,
      needsReview: false,
    };
  }

  if (containsDistractionIntent(content)) {
    return {
      intent: "distraction",
      confidence: 0.9,
      action: {
        kind: "set_list",
        listName: DISTRACTION_LIST_NAME,
        source: "rule",
      },
      needsReview: false,
    };
  }

  return {
    intent: "note",
    confidence: 0.55,
    action: null,
    needsReview: false,
  };
}

async function llmDecision(content: string, apiKey: string): Promise<AgentDecision | null> {
  if (!apiKey) {
    return null;
  }

  const response = await httpPostJson(
    "https://api.openai.com/v1/chat/completions",
    {
      model: MODEL,
      temperature: 0,
      messages: [
        {
          role: "system",
          content:
            "Classify capture intent and return JSON only with keys intent, confidence, reminder_time, list_name, needs_review. Intent must be one of calendar, reminder, task, note, distraction.",
        },
        {
          role: "user",
          content,
        },
      ],
    },
    {
      Authorization: `Bearer ${apiKey}`,
    },
  );

  const data = (await response.json()) as OpenAiClassificationResponse;
  const raw = data.choices?.[0]?.message?.content?.trim() ?? "";
  const jsonObject = extractJsonObject(raw);
  if (!jsonObject) {
    return null;
  }

  const parsed = JSON.parse(jsonObject) as Partial<{
    intent: AgentIntent;
    confidence: number | string;
    reminder_time: string | null;
    list_name: string | null;
    needs_review: boolean;
  }>;

  const intent = parsed.intent;
  if (!intent || !["calendar", "reminder", "task", "note", "distraction"].includes(intent)) {
    return null;
  }

  const confidence = clamp(Number(parsed.confidence ?? 0), 0, 1);
  const reminderTime = typeof parsed.reminder_time === "string" ? parsed.reminder_time : null;
  const listName = typeof parsed.list_name === "string" ? parsed.list_name.trim() : "";
  const needsReview = Boolean(parsed.needs_review);

  return {
    intent,
    confidence,
    action: reminderTime
      ? {
          kind: "set_reminder",
          reminderTime,
          source: "llm",
        }
      : intent === "distraction"
        ? {
            kind: "set_list",
            listName: listName || DISTRACTION_LIST_NAME,
            source: "llm",
          }
        : null,
    needsReview,
  };
}

async function decideForCapture(
  capture: Capture,
  settings: AgentSettings,
  budget: LlmBudget,
): Promise<AgentDecision> {
  if (capture.capture_lane === "distraction" && capture.list_name.trim().toLowerCase() !== DISTRACTION_LIST_NAME.toLowerCase()) {
    return {
      intent: "distraction",
      confidence: 0.99,
      action: {
        kind: "set_list",
        listName: DISTRACTION_LIST_NAME,
        source: "rule",
      },
      needsReview: false,
    };
  }

  const rule = ruleBasedDecision(capture.content);
  if (rule.confidence >= 0.85) {
    return rule;
  }

  // Respect the daily LLM budget; fall back to the rule decision when exhausted
  // (or when no API key is configured) instead of making a paid API call.
  if (!settings.openAiApiKey || budget.used >= budget.limit) {
    return rule;
  }

  await recordLlmCall(budget);
  const llm = await llmDecision(capture.content, settings.openAiApiKey);
  return llm ?? rule;
}

async function applyAction(captureId: string, action: AgentAction): Promise<void> {
  if (action.kind === "set_reminder") {
    await setCaptureReminder(captureId, action.reminderTime);
    return;
  }
  if (action.kind === "set_list") {
    await setCaptureListName(captureId, action.listName);
  }
}

async function processCapture(
  capture: Capture,
  settings: AgentSettings,
  budget: LlmBudget,
): Promise<"auto" | "review" | "failed"> {
  const attempts = (capture.agent_attempts ?? 0) + 1;

  try {
    const decision = await decideForCapture(capture, settings, budget);
    const actionJson = decision.action ? JSON.stringify(decision.action) : null;
    const canAutoApply =
      decision.action !== null &&
      !decision.needsReview &&
      decision.confidence >= settings.autoApplyThreshold;

    if (canAutoApply && decision.action) {
      await applyAction(capture.id, decision.action);
      await updateAgentJob(capture.id, {
        status: "completed",
        attempts,
        intent: decision.intent,
        confidence: decision.confidence,
        actionJson,
        needsReview: 0,
        error: null,
      });
      return "auto";
    }

    await updateAgentJob(capture.id, {
      status: decision.action ? "needs_review" : "completed",
      attempts,
      intent: decision.intent,
      confidence: decision.confidence,
      actionJson,
      needsReview: decision.action ? 1 : 0,
      error: null,
    });
    return decision.action ? "review" : "auto";
  } catch (error) {
    const nextStatus = attempts >= MAX_RETRIES ? "failed" : "retry";
    await updateAgentJob(capture.id, {
      status: nextStatus,
      attempts,
      error: error instanceof Error ? error.message.slice(0, 400) : String(error).slice(0, 400),
    });
    return "failed";
  }
}

export async function runAgentPass(limit = 25): Promise<AgentPassStats> {
  if (runningPass) {
    return runningPass;
  }

  runningPass = (async () => {
    const settings = await loadAgentSettings();
    if (!settings.enabled) {
      return { processed: 0, autoApplied: 0, needsReview: 0, failed: 0 };
    }

    const captures = await listPendingAgentCaptures(limit);
    const stats: AgentPassStats = { processed: 0, autoApplied: 0, needsReview: 0, failed: 0 };
    const budget: LlmBudget = {
      used: await getLlmUsageToday(),
      limit: settings.dailyLlmLimit,
    };

    for (const capture of captures) {
      if ((capture.agent_attempts ?? 0) >= MAX_RETRIES && capture.agent_status === "retry") {
        await updateAgentJob(capture.id, {
          status: "failed",
          error: "Max retries reached.",
        });
        stats.failed += 1;
        continue;
      }

      stats.processed += 1;
      const result = await processCapture(capture, settings, budget);
      if (result === "review") {
        stats.needsReview += 1;
      } else if (result === "auto") {
        stats.autoApplied += 1;
      } else {
        stats.failed += 1;
      }
    }

    return stats;
  })();

  try {
    return await runningPass;
  } finally {
    runningPass = null;
  }
}

export async function approveAgentSuggestion(captureId: string): Promise<void> {
  const capture = await getCaptureById(captureId);
  if (!capture) {
    throw new Error("Capture not found.");
  }

  const action = parseAgentAction(capture.agent_action_json);
  if (!action) {
    throw new Error("No valid suggestion to approve.");
  }

  await applyAction(captureId, action);
  await updateAgentJob(captureId, {
    status: "completed",
    needsReview: 0,
    error: null,
  });
}

export async function dismissAgentSuggestion(captureId: string): Promise<void> {
  await updateAgentJob(captureId, {
    status: "completed",
    needsReview: 0,
    error: null,
  });
}
