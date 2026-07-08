/**
 * Task-vs-note intent heuristic (Stage 1 of smart routing).
 *
 * Deterministic and explainable by design: every classification carries the
 * signal that produced it, so the routing preview can answer "why there?" and
 * the user can correct it once via a rule. When nothing matches confidently,
 * the answer is "unsure" and routing falls through to the existing defaults.
 */

export type CaptureIntent = "task" | "note" | "unsure";

export interface IntentResult {
  intent: CaptureIntent;
  /** Human-readable trigger, e.g. `starts with "buy"` — embedded in routing reasons. */
  signal: string | null;
}

/** High-precision action verbs that open a to-do ("buy milk", "call the bank"). */
const IMPERATIVE_VERBS = new Set([
  "apply",
  "ask",
  "backup",
  "book",
  "bring",
  "buy",
  "call",
  "cancel",
  "charge",
  "check",
  "clean",
  "collect",
  "complete",
  "deposit",
  "drop",
  "email",
  "feed",
  "fill",
  "finish",
  "fix",
  "get",
  "grab",
  "install",
  "invite",
  "mail",
  "message",
  "order",
  "pay",
  "pick",
  "practice",
  "print",
  "read",
  "refill",
  "register",
  "renew",
  "reply",
  "return",
  "review",
  "schedule",
  "sell",
  "send",
  "ship",
  "sign",
  "submit",
  "take",
  "tell",
  "text",
  "transfer",
  "update",
  "upgrade",
  "walk",
  "wash",
  "water",
]);

const CHECKLIST_REGEX = /(^|\n)\s*-\s*\[[ xX]?\]/;
const TASK_PHRASE_REGEX =
  /\b(don'?t forget|need to|have to|has to|remember to|make sure (?:to|i|we)|to-?do)\b/i;
const URL_REGEX = /\bhttps?:\/\/|\bwww\./i;
const NOTE_OPENER_REGEX =
  /^(idea|ideas|note|notes|thought|thoughts|journal|draft|brainstorm|observation|quote)\b/i;
const QUESTION_OPENER_REGEX =
  /^(what|why|how|when|where|which|who|should|could|would|can|is|are|do|does|did)\b/i;
const NOTE_LENGTH_THRESHOLD = 200;

function firstWord(text: string): string {
  return text.trim().split(/\s+/)[0]?.toLowerCase().replace(/[^a-z'-]/g, "") ?? "";
}

function nonEmptyLineCount(text: string): number {
  return text.split("\n").filter((line) => line.trim().length > 0).length;
}

export function classifyIntent(rawText: string): IntentResult {
  const text = rawText.trim();
  if (text.length === 0) {
    return { intent: "unsure", signal: null };
  }

  // Task signals first: checklists and to-do phrasing are unambiguous even
  // inside longer text, and an imperative opener is the classic to-do shape.
  if (CHECKLIST_REGEX.test(text)) {
    return { intent: "task", signal: "has a checklist" };
  }

  const taskPhrase = text.match(TASK_PHRASE_REGEX);
  if (taskPhrase) {
    return { intent: "task", signal: `says "${taskPhrase[0].toLowerCase()}"` };
  }

  const opener = firstWord(text);
  const wordCount = text.split(/\s+/).length;
  if (
    IMPERATIVE_VERBS.has(opener) &&
    wordCount >= 2 &&
    nonEmptyLineCount(text) === 1 &&
    !URL_REGEX.test(text)
  ) {
    return { intent: "task", signal: `starts with "${opener}"` };
  }

  // Note signals: reference material and open-ended thinking.
  if (URL_REGEX.test(text)) {
    return { intent: "note", signal: "contains a link" };
  }
  if (NOTE_OPENER_REGEX.test(text)) {
    return { intent: "note", signal: `starts with "${firstWord(text)}"` };
  }
  if (QUESTION_OPENER_REGEX.test(text) && text.endsWith("?")) {
    return { intent: "note", signal: "is a question" };
  }
  if (nonEmptyLineCount(text) >= 3 || text.length > NOTE_LENGTH_THRESHOLD) {
    return { intent: "note", signal: "long-form text" };
  }

  return { intent: "unsure", signal: null };
}
