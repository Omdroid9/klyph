import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { parseReminderSyntax } from "./parser";

// Fixed reference instant so chrono's relative parsing is deterministic.
// Local time is used intentionally because the parser emits local-ISO strings.
const NOW = new Date(2026, 5, 4, 10, 0, 0); // Thu Jun 4 2026, 10:00 local

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(NOW);
});

afterEach(() => {
  vi.useRealTimers();
});

describe("parseReminderSyntax", () => {
  it("returns no reminder when there are no temporal hints", () => {
    const result = parseReminderSyntax("buy groceries");
    expect(result.reminderTime).toBeNull();
    expect(result.cleanedContent).toBe("buy groceries");
    expect(result.isAmbiguous).toBe(false);
  });

  it("trims and returns empty for blank input", () => {
    const result = parseReminderSyntax("   ");
    expect(result.reminderTime).toBeNull();
    expect(result.cleanedContent).toBe("");
  });

  it("resolves the @tomorrow shortcut to next day 9am and strips the marker", () => {
    const result = parseReminderSyntax("ship invoice @tomorrow");
    expect(result.reminderTime).not.toBeNull();

    const date = new Date(result.reminderTime!);
    expect(date.getDate()).toBe(5);
    expect(date.getHours()).toBe(9);
    expect(result.cleanedContent).toBe("ship invoice");
    expect(result.cleanedContent).not.toContain("@");
  });

  it("resolves the @today shortcut to today 6pm", () => {
    const result = parseReminderSyntax("standup notes @today");
    expect(result.reminderTime).not.toBeNull();

    const date = new Date(result.reminderTime!);
    expect(date.getDate()).toBe(4);
    expect(date.getHours()).toBe(18);
  });

  it("honors an explicit clock time and is not ambiguous", () => {
    const result = parseReminderSyntax("submit report at 3pm");
    expect(result.reminderTime).not.toBeNull();

    const date = new Date(result.reminderTime!);
    expect(date.getHours()).toBe(15);
    expect(date.getMinutes()).toBe(0);
    expect(result.isAmbiguous).toBe(false);
  });

  it("flags a date without a time as ambiguous", () => {
    const result = parseReminderSyntax("call the dentist tomorrow");
    expect(result.reminderTime).not.toBeNull();
    expect(result.isAmbiguous).toBe(true);
    expect(result.ambiguityReason).toBeTruthy();
  });

  it("resolves an ordinal day of month", () => {
    const result = parseReminderSyntax("pay rent on the 15th at 9am");
    expect(result.reminderTime).not.toBeNull();

    const date = new Date(result.reminderTime!);
    expect(date.getDate()).toBe(15);
    expect(date.getHours()).toBe(9);
  });

  it("never returns a time in the past for forward-dated input", () => {
    const result = parseReminderSyntax("meeting at 9am");
    expect(result.reminderTime).not.toBeNull();
    expect(new Date(result.reminderTime!).getTime()).toBeGreaterThan(NOW.getTime());
  });
});
