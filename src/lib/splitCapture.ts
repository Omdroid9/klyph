import { parseReminderSyntax } from "./parser";

/**
 * Per-line classification for mixed captures — a meeting-notes dump where
 * some lines are actionable ("do x and y tomorrow") and the rest is prose.
 * Actionable lines can be sent to Reminders individually while the prose
 * stays together as one Apple Note.
 */

export interface ClassifiedLine {
  /** Original line, including any list prefix. */
  raw: string;
  /** Prefix-stripped, trimmed line body. */
  content: string;
  kind: "reminder" | "note";
  /** Local ISO time when the line carries one. */
  reminderTime: string | null;
  /** Line body with the time phrase removed (what the reminder should say). */
  cleanedContent: string;
}

export interface CaptureSplit {
  reminders: ClassifiedLine[];
  notes: ClassifiedLine[];
  /** First line when it reads as a title ("Meeting notes:") — kept with the note half. */
  heading: string | null;
}

const LIST_PREFIX_REGEX = /^\s*(?:- \[[ xX]\]\s+|[-*]\s+|\d+\.\s+)/;
const CHECKBOX_REGEX = /^\s*- \[[ xX]\]\s+/;
const HEADING_REGEX = /:\s*$/;

const REMINDER_COMMAND_REGEX =
  /^\s*(?:please\s+)?(?:remind\s+me(?:\s+to)?|remember\s+to|set\s+(?:a\s+)?reminder\s+(?:to|for)|add\s+(?:a\s+)?reminder\s+(?:to|for))\s+/i;

function classifyLine(raw: string): ClassifiedLine | null {
  const content = raw.replace(LIST_PREFIX_REGEX, "").trim();
  if (!content) {
    return null;
  }

  const parsed = parseReminderSyntax(content);
  const isReminder =
    Boolean(parsed.reminderTime) ||
    REMINDER_COMMAND_REGEX.test(content) ||
    CHECKBOX_REGEX.test(raw);

  return {
    raw,
    content,
    kind: isReminder ? "reminder" : "note",
    reminderTime: parsed.reminderTime,
    cleanedContent: (parsed.cleanedContent.trim() || content).replace(REMINDER_COMMAND_REGEX, "").trim() || content,
  };
}

/**
 * Returns a split when the text genuinely mixes reminder-like and note-like
 * lines (at least one of each across 2+ content lines); null otherwise so
 * single-intent captures keep the normal routing path.
 */
export function splitCaptureLines(text: string): CaptureSplit | null {
  const rawLines = text.split("\n");

  let heading: string | null = null;
  const lines: ClassifiedLine[] = [];

  rawLines.forEach((raw, index) => {
    const body = raw.replace(LIST_PREFIX_REGEX, "").trim();
    if (!body) {
      return;
    }
    if (index === 0 && HEADING_REGEX.test(body) && !CHECKBOX_REGEX.test(raw)) {
      heading = body.replace(HEADING_REGEX, "").trim();
      return;
    }
    const classified = classifyLine(raw);
    if (classified) {
      lines.push(classified);
    }
  });

  const reminders = lines.filter((line) => line.kind === "reminder");
  const notes = lines.filter((line) => line.kind === "note");

  if (reminders.length === 0 || notes.length === 0) {
    return null;
  }

  return { reminders, notes, heading };
}

/** Rebuilds the prose half as one note body, restoring the heading line. */
export function noteContentFromSplit(split: CaptureSplit): string {
  const lines = split.notes.map((line) => line.raw.trimEnd());
  if (split.heading) {
    lines.unshift(`${split.heading}:`);
  }
  return lines.join("\n").trim();
}
