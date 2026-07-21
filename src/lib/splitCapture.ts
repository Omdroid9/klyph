import { classifyIntent, classifyTimedEvent } from "./intent";
import { parseReminderSyntax } from "./parser";

/**
 * Per-line classification for mixed captures — a meeting-notes dump where
 * some lines are actionable ("do x and y tomorrow") and the rest is prose.
 * Actionable lines can be sent to Reminders (or Apple Calendar, for lines
 * that read as an appointment) individually while the prose stays together
 * as one Apple Note. Reuses the same event/task signals as single-line
 * routing so "Meeting with Mark at 2pm" lands the same place whether it's
 * typed alone or buried in a list — same content, same destination.
 */

export interface ClassifiedLine {
  /** Original line, including any list prefix. */
  raw: string;
  /** Prefix-stripped, trimmed line body. */
  content: string;
  kind: "event" | "reminder" | "note";
  /** Local ISO time when the line carries one. */
  reminderTime: string | null;
  /** Line body with the time phrase removed (what the reminder should say). */
  cleanedContent: string;
  /** Human-readable trigger for the routing reason, e.g. `has "meeting"`. */
  signal: string | null;
}

export interface CaptureSplit {
  events: ClassifiedLine[];
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
  const cleanedContent =
    (parsed.cleanedContent.trim() || content).replace(REMINDER_COMMAND_REGEX, "").trim() || content;

  let kind: ClassifiedLine["kind"] = "note";
  let signal: string | null = null;

  if (parsed.reminderTime) {
    // A timed line is either a slot you occupy (event) or a nudge (reminder)
    // — same distinction classifyTimedEvent draws for single-line captures.
    const event = classifyTimedEvent(content);
    if (event.isEvent) {
      kind = "event";
      signal = event.signal;
    } else {
      kind = "reminder";
      signal = "has a time";
    }
  } else if (REMINDER_COMMAND_REGEX.test(content) || CHECKBOX_REGEX.test(raw)) {
    kind = "reminder";
    signal = CHECKBOX_REGEX.test(raw) ? "checklist item" : "explicit reminder";
  } else {
    // No time signal: fall back to the same task-vs-note read a standalone
    // capture would get, so "groceries after work" isn't stranded as prose
    // just because it has no resolvable date.
    const intent = classifyIntent(content);
    if (intent.intent === "task") {
      kind = "reminder";
      signal = intent.signal;
    }
  }

  return { raw, content, kind, reminderTime: parsed.reminderTime, cleanedContent, signal };
}

/**
 * Returns a split when the text genuinely mixes destinations — at least two
 * of the three buckets (events / reminders / notes) are non-empty; null
 * otherwise so single-intent captures keep the normal routing path.
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

  const events = lines.filter((line) => line.kind === "event");
  const reminders = lines.filter((line) => line.kind === "reminder");
  const notes = lines.filter((line) => line.kind === "note");

  const bucketsInUse =
    Number(events.length > 0) + Number(reminders.length > 0) + Number(notes.length > 0);
  if (bucketsInUse < 2) {
    return null;
  }

  return { events, reminders, notes, heading };
}

/** Rebuilds the prose half as one note body, restoring the heading line. */
export function noteContentFromSplit(split: CaptureSplit): string {
  const lines = split.notes.map((line) => line.raw.trimEnd());
  if (split.heading) {
    lines.unshift(`${split.heading}:`);
  }
  return lines.join("\n").trim();
}
