import { beforeEach, describe, expect, it, vi } from "vitest";
import type { CaptureDestinations, RoutingRule } from "../../types";
import type { IntegrationSettings } from "./connectionStatus";

const platformState = { mac: true };

vi.mock("../platform", () => ({
  isMacOS: () => platformState.mac,
}));

import {
  describeRule,
  evaluateRouting,
  ruleMatches,
  sameDestinations,
  type RoutingInput,
} from "./captureRouting";

function settings(overrides: Partial<IntegrationSettings> = {}): IntegrationSettings {
  return {
    slack_webhook_url: null,
    discord_webhook_url: null,
    notion_token: null,
    notion_page_id: null,
    google_tasks_access_token: null,
    google_tasks_refresh_token: null,
    google_tasks_list_id: null,
    google_calendar_id: null,
    ...overrides,
  };
}

const GOOGLE_CONNECTED: Partial<IntegrationSettings> = {
  google_tasks_access_token: "token",
  google_tasks_list_id: "list",
  google_calendar_id: "calendar",
};

function destinations(overrides: Partial<CaptureDestinations> = {}): CaptureDestinations {
  return {
    slack: false,
    discord: false,
    notion: false,
    googleTasks: false,
    googleCalendar: false,
    appleReminders: false,
    reminders: false,
    appleCalendar: false,
    ...overrides,
  };
}

function rule(overrides: Partial<RoutingRule> = {}): RoutingRule {
  return {
    id: "rule-1",
    field: "tag",
    match_value: "work",
    destinations: destinations({ slack: true }),
    ...overrides,
  };
}

function input(overrides: Partial<RoutingInput> = {}): RoutingInput {
  return {
    // Deliberately intent-neutral so tests exercise the branch they name.
    text: "project phoenix",
    tag: "untagged",
    lane: "focus",
    listName: "Inbox",
    reminderTime: null,
    isReminderCommand: false,
    settings: settings(),
    rules: [],
    ...overrides,
  };
}

beforeEach(() => {
  platformState.mac = true;
});

describe("ruleMatches", () => {
  it("matches tags case-insensitively", () => {
    expect(ruleMatches(rule({ match_value: "Work" }), input({ tag: "work" }))).toBe(true);
    expect(ruleMatches(rule({ match_value: "work" }), input({ tag: "personal" }))).toBe(false);
  });

  it("matches keywords anywhere in the text", () => {
    const keywordRule = rule({ field: "keyword", match_value: "groceries" });
    expect(ruleMatches(keywordRule, input({ text: "Get GROCERIES after work" }))).toBe(true);
    expect(ruleMatches(keywordRule, input({ text: "call mom" }))).toBe(false);
  });

  it("matches lists and lanes", () => {
    expect(ruleMatches(rule({ field: "list", match_value: "inbox" }), input({ listName: "Inbox" }))).toBe(true);
    expect(
      ruleMatches(rule({ field: "lane", match_value: "distraction" }), input({ lane: "distraction" })),
    ).toBe(true);
  });
});

describe("evaluateRouting", () => {
  it("routes by a matching rule before any heuristic and explains it", () => {
    const decision = evaluateRouting(
      input({
        tag: "work",
        reminderTime: "2026-07-08T17:00:00",
        settings: settings({ ...GOOGLE_CONNECTED, slack_webhook_url: "https://hook" }),
        rules: [rule({ destinations: destinations({ slack: true }) })],
      }),
    );

    expect(decision.source).toBe("rule");
    expect(decision.ruleId).toBe("rule-1");
    expect(decision.destinations).toEqual(destinations({ slack: true }));
    expect(decision.reason).toContain("#work");
    expect(decision.reason).toContain("Slack");
  });

  it("skips a rule whose destinations are no longer connected", () => {
    const decision = evaluateRouting(
      input({
        tag: "work",
        settings: settings({ slack_webhook_url: "https://hook" }),
        rules: [rule({ destinations: destinations({ notion: true }) })],
      }),
    );

    expect(decision.source).toBe("connected-default");
    expect(decision.destinations.slack).toBe(true);
  });

  it("prefers Reminders for reminder-style commands with a time", () => {
    const decision = evaluateRouting(
      input({
        text: "remind me to call mom tomorrow at 5pm",
        reminderTime: "2026-07-08T17:00:00",
        isReminderCommand: true,
      }),
    );

    expect(decision.source).toBe("reminder-command");
    expect(decision.destinations.reminders).toBe(true);
    expect(decision.reason).toContain("Reminders");
  });

  it("routes a timed appointment to Google Calendar when Google is connected", () => {
    const decision = evaluateRouting(
      input({
        text: "team meeting",
        reminderTime: "2026-07-08T17:00:00",
        settings: settings(GOOGLE_CONNECTED),
      }),
    );

    expect(decision.source).toBe("time-calendar");
    expect(decision.destinations.googleCalendar).toBe(true);
    expect(decision.reason).toContain("appointment");
  });

  it("routes a timed appointment to Apple Calendar on a Mac without Google", () => {
    const decision = evaluateRouting(
      input({ text: "dentist appointment", reminderTime: "2026-07-08T09:00:00" }),
    );

    expect(decision.source).toBe("event-apple-calendar");
    expect(decision.destinations.appleCalendar).toBe(true);
    expect(decision.destinations.reminders).toBe(false);
    expect(decision.reason).toContain("Apple Calendar");
    expect(decision.reason).toContain("appointment");
  });

  it("routes a timed civic appointment (biometrics) to Apple Calendar", () => {
    const decision = evaluateRouting(
      input({
        text: "lets get biometrics done tomorrow at 11am",
        reminderTime: "2026-07-15T11:00:00",
      }),
    );

    expect(decision.source).toBe("event-apple-calendar");
    expect(decision.destinations.appleCalendar).toBe(true);
    expect(decision.reason).toContain("biometrics");
  });

  it("treats a deadline ('by 5pm') as a task even with event-ish words", () => {
    const decision = evaluateRouting(
      input({
        text: "get the visa paperwork done by 5pm",
        reminderTime: "2026-07-15T17:00:00",
      }),
    );

    expect(decision.source).toBe("time-reminders");
    expect(decision.destinations.appleCalendar).toBe(false);
    expect(decision.destinations.reminders).toBe(true);
  });

  it("routes a timed to-do to Reminders, not a calendar", () => {
    const decision = evaluateRouting(
      input({ text: "pay rent", reminderTime: "2026-07-08T17:00:00" }),
    );

    expect(decision.source).toBe("time-reminders");
    expect(decision.destinations.reminders).toBe(true);
    expect(decision.destinations.appleCalendar).toBe(false);
  });

  it("keeps a timed to-do in Reminders even when Google is connected", () => {
    const decision = evaluateRouting(
      input({
        text: "pay rent",
        reminderTime: "2026-07-08T17:00:00",
        settings: settings(GOOGLE_CONNECTED),
      }),
    );

    expect(decision.source).toBe("time-reminders");
    expect(decision.destinations.reminders).toBe(true);
    expect(decision.destinations.googleCalendar).toBe(false);
  });

  it("falls back to Reminders for timed captures without Google", () => {
    const decision = evaluateRouting(input({ reminderTime: "2026-07-08T17:00:00" }));

    expect(decision.source).toBe("time-reminders");
    expect(decision.destinations.reminders).toBe(true);
  });

  it("uses all connected apps as the default for plain captures", () => {
    const decision = evaluateRouting(
      input({ settings: settings({ slack_webhook_url: "https://hook" }) }),
    );

    expect(decision.source).toBe("connected-default");
    expect(decision.destinations.slack).toBe(true);
    expect(decision.destinations.appleReminders).toBe(true);
  });

  it("falls back to Apple Notes only when nothing is connected — never dateless Reminders", () => {
    const decision = evaluateRouting(input());

    expect(decision.source).toBe("notes-fallback");
    expect(decision.destinations).toEqual(destinations({ appleReminders: true }));
    expect(decision.destinations.reminders).toBe(false);
    expect(decision.reason).toContain("Apple Notes");
  });

  it("keeps Reminders out of the connected-apps default spray", () => {
    const decision = evaluateRouting(
      input({ settings: settings({ slack_webhook_url: "https://hook" }) }),
    );

    expect(decision.source).toBe("connected-default");
    expect(decision.destinations.reminders).toBe(false);
  });

  it("routes nowhere off-Mac with no providers, and says so", () => {
    platformState.mac = false;
    const decision = evaluateRouting(input());

    expect(decision.source).toBe("none");
    expect(Object.values(decision.destinations).every((value) => !value)).toBe(true);
    expect(decision.reason).toContain("locally");
  });

  it("routes untimed to-dos to Reminders instead of the Notes graveyard", () => {
    const decision = evaluateRouting(input({ text: "buy milk" }));

    expect(decision.source).toBe("intent-task");
    expect(decision.destinations.reminders).toBe(true);
    expect(decision.destinations.appleReminders).toBe(false);
    expect(decision.reason).toContain("to-do");
    expect(decision.reason).toContain('"buy"');
  });

  it("routes untimed to-dos to Google Tasks off-Mac when Google is connected", () => {
    platformState.mac = false;
    const decision = evaluateRouting(
      input({ text: "buy milk", settings: settings(GOOGLE_CONNECTED) }),
    );

    expect(decision.source).toBe("intent-task");
    expect(decision.destinations.googleTasks).toBe(true);
  });

  it("routes note-shaped captures to Apple Notes, not Reminders", () => {
    const decision = evaluateRouting(input({ text: "ideas for the marketing site" }));

    expect(decision.source).toBe("intent-note");
    expect(decision.destinations.appleReminders).toBe(true);
    expect(decision.destinations.reminders).toBe(false);
    expect(decision.reason).toContain("note");
  });

  it("lets rules and time heuristics outrank intent", () => {
    const ruled = evaluateRouting(
      input({
        text: "buy milk",
        settings: settings({ notion_token: "t", notion_page_id: "p" }),
        rules: [rule({ field: "keyword", match_value: "milk", destinations: destinations({ notion: true }) })],
      }),
    );
    expect(ruled.source).toBe("rule");

    const timed = evaluateRouting(input({ text: "buy milk tomorrow at 5pm", reminderTime: "2026-07-09T17:00:00" }));
    expect(timed.source).toBe("time-reminders");
  });
});

describe("helpers", () => {
  it("compares destination sets", () => {
    expect(sameDestinations(destinations({ slack: true }), destinations({ slack: true }))).toBe(true);
    expect(sameDestinations(destinations({ slack: true }), destinations({ notion: true }))).toBe(false);
  });

  it("describes rules for the settings UI", () => {
    expect(describeRule(rule())).toBe("#work → Slack");
    expect(describeRule(rule({ field: "keyword", match_value: "idea" }))).toBe('"idea" → Slack');
  });
});
