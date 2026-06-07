import { parse } from "chrono-node";

export interface ParsedReminder {
  cleanedContent: string;
  reminderTime: string | null;
  previewLabel: string | null;
  confidence: number;
  isAmbiguous: boolean;
  ambiguityReason: string | null;
  allDay: boolean;
  durationMinutes: number | null;
  debug: string;
}

const BRACKET_MENTION_REGEX = /(?:^|\s)@\[([^\]]+)\]/i;
const REMINDER_MARKER_REGEX =
  /(^|\s)@\s*(today|tomorrow|tonight|next|mon(?:day)?|tue(?:sday)?|wed(?:nesday)?|thu(?:rsday)?|fri(?:day)?|sat(?:urday)?|sun(?:day)?|\d{1,2}(?::\d{2})?\s*(?:am|pm)?)(?=\b|$)/gi;
const EXPLICIT_MARKER_REGEX = /(?:^|\s)@/;
const TEMPORAL_HINT_REGEX =
  /\b(today|tomorrow|tonight|next|monday|tuesday|wednesday|thursday|friday|saturday|sunday|mon|tue|wed|thu|fri|sat|sun|am|pm|noon|midnight|eod|end of day|this evening|next business day|all day|throughout the day|anytime|\d{1,2}:\d{2}|\d{1,2}\s?(am|pm)|\d{1,2}(st|nd|rd|th)|\d{4}-\d{1,2}-\d{1,2}|\d{1,2}\/\d{1,2}(?:\/\d{2,4})?)\b/i;
const TIME_12H_REGEX = /\b(\d{1,2})(?::([0-5]\d))?\s*(am|pm)\b/i;
const TIME_24H_REGEX = /\b([01]?\d|2[0-3]):([0-5]\d)\b/;
const ORDINAL_DAY_REGEX = /\b(?:on\s+)?(?:the\s+)?([12]?\d|3[01])(st|nd|rd|th)\b/i;
const ALL_DAY_HINT_REGEX = /\b(all day|throughout the day|during the day|whole day|anytime)\b/i;
const DURATION_HOURS_REGEX = /\bfor\s+(\d{1,2})\s*(h|hr|hrs|hour|hours)\b/i;
const DURATION_MINUTES_REGEX = /\bfor\s+(\d{1,3})\s*(m|min|mins|minute|minutes)\b/i;

function toLocalIso(input: Date): string {
  const timezoneOffset = input.getTimezoneOffset() * 60_000;
  return new Date(input.getTime() - timezoneOffset).toISOString().slice(0, 19);
}

function parseShortcutKeyword(token: string, now: Date): Date | null {
  const keyword = token.toLowerCase();

  if (keyword === "today") {
    const d = new Date(now);
    d.setHours(18, 0, 0, 0);
    return d;
  }

  if (keyword === "tomorrow") {
    const d = new Date(now);
    d.setDate(d.getDate() + 1);
    d.setHours(9, 0, 0, 0);
    return d;
  }

  return null;
}

function scoreParsedResult(result: (ReturnType<typeof parse>)[number]): number {
  let score = result.text.trim().length;

  if (result.start.isCertain("day")) score += 8;
  if (result.start.isCertain("month")) score += 8;
  if (result.start.isCertain("year")) score += 8;
  if (result.start.isCertain("weekday")) score += 6;
  if (result.start.isCertain("hour")) score += 20;
  if (result.start.isCertain("minute")) score += 6;
  if (/\b(am|pm)\b|:/.test(result.text)) score += 8;

  return score;
}

function pickBestParsedResult(
  results: ReturnType<typeof parse>,
): (ReturnType<typeof parse>)[number] | null {
  if (results.length === 0) {
    return null;
  }

  const sorted = [...results].sort((a, b) => scoreParsedResult(b) - scoreParsedResult(a));
  return sorted[0] ?? null;
}

function extractExplicitTime(content: string): { hour: number; minute: number } | null {
  const m12 = content.match(TIME_12H_REGEX);
  if (m12) {
    const rawHour = Number(m12[1]);
    const minute = Number(m12[2] ?? "0");
    const meridiem = m12[3].toLowerCase();

    let hour = rawHour % 12;
    if (meridiem === "pm") {
      hour += 12;
    }
    return { hour, minute };
  }

  const m24 = content.match(TIME_24H_REGEX);
  if (m24) {
    return {
      hour: Number(m24[1]),
      minute: Number(m24[2]),
    };
  }

  return null;
}

function resolveDurationMinutes(text: string): number | null {
  const hours = text.match(DURATION_HOURS_REGEX);
  if (hours) {
    return Math.min(Math.max(Number(hours[1]) * 60, 15), 8 * 60);
  }

  const minutes = text.match(DURATION_MINUTES_REGEX);
  if (minutes) {
    return Math.min(Math.max(Number(minutes[1]), 15), 8 * 60);
  }

  return null;
}

function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function normalizeReminderInput(content: string): string {
  return content
    .replace(/(^|\s)@\[(.+?)\]/g, "$1$2")
    .replace(REMINDER_MARKER_REGEX, "$1$2")
    .replace(/\s{2,}/g, " ")
    .trim();
}

function removeParsedPhrase(content: string, parsedText: string): string {
  const phrase = parsedText.trim();
  if (!phrase) {
    return content.trim();
  }

  const pattern = new RegExp(
    `(?:^|\\s)(?:by\\s+|on\\s+|at\\s+|around\\s+|before\\s+|after\\s+|for\\s+)?${escapeRegex(
      phrase,
    )}(?:[,.!?])?(?=\\s|$)`,
    "i",
  );

  const cleaned = content
    .replace(pattern, " ")
    .replace(/\b(by|on|at|around|before|after|for)\s+(?=[,.;!?]|$)/gi, " ")
    .replace(/\s+([,.;!?])/g, "$1")
    .replace(/[,\s]+$/g, "")
    .replace(/\s{2,}/g, " ")
    .trim();

  return cleaned.length > 0 ? cleaned : content.trim();
}

function applyShortcutOverrideIfNeeded(
  reminder: Date,
  sourceText: string,
  original: string,
  hasExplicitHour: boolean,
): Date {
  if (hasExplicitHour) {
    return reminder;
  }

  const isTodayShortcut = /(?:^|\s)@today\b/i.test(original) || /^today$/i.test(sourceText.trim());
  if (isTodayShortcut) {
    const next = new Date(reminder);
    next.setHours(18, 0, 0, 0);
    return next;
  }

  const isTomorrowShortcut =
    /(?:^|\s)@tomorrow\b/i.test(original) || /^tomorrow$/i.test(sourceText.trim());
  if (isTomorrowShortcut) {
    const next = new Date(reminder);
    next.setHours(9, 0, 0, 0);
    return next;
  }

  return reminder;
}

function applyExplicitTimeIfNeeded(
  reminder: Date,
  normalizedText: string,
  parsedResult: (ReturnType<typeof parse>)[number],
): Date {
  if (parsedResult.start.isCertain("hour")) {
    return reminder;
  }

  const explicitTime = extractExplicitTime(normalizedText);
  if (!explicitTime) {
    return reminder;
  }

  const next = new Date(reminder);
  next.setHours(explicitTime.hour, explicitTime.minute, 0, 0);
  return next;
}

function extractOrdinalDay(text: string): number | null {
  const match = text.match(ORDINAL_DAY_REGEX);
  if (!match) {
    return null;
  }

  const day = Number(match[1]);
  if (Number.isNaN(day) || day < 1 || day > 31) {
    return null;
  }

  return day;
}

function applyOrdinalDayIfNeeded(
  reminder: Date,
  normalizedText: string,
  parsedResult: (ReturnType<typeof parse>)[number],
  now: Date,
): Date {
  if (parsedResult.start.isCertain("day")) {
    return reminder;
  }

  const ordinalDay = extractOrdinalDay(normalizedText);
  if (!ordinalDay) {
    return reminder;
  }

  const targetHour = reminder.getHours();
  const targetMinute = reminder.getMinutes();

  for (let monthOffset = 0; monthOffset < 14; monthOffset += 1) {
    const candidate: Date = new Date(
      now.getFullYear(),
      now.getMonth() + monthOffset,
      ordinalDay,
      targetHour,
      targetMinute,
      0,
      0,
    );

    if (candidate.getDate() !== ordinalDay) {
      continue;
    }

    if (candidate.getTime() >= now.getTime()) {
      return candidate;
    }
  }

  return reminder;
}

function removeOrdinalPhrase(content: string): string {
  return content
    .replace(/\b(on\s+)?(the\s+)?([12]?\d|3[01])(st|nd|rd|th)\b/gi, " ")
    .replace(/\s+([,.;!?])/g, "$1")
    .replace(/[,\s]+$/g, "")
    .replace(/\s{2,}/g, " ")
    .trim();
}

function nextBusinessDayAt(hour: number, minute: number, now: Date): Date {
  const next = new Date(now);
  next.setHours(hour, minute, 0, 0);

  do {
    next.setDate(next.getDate() + 1);
  } while (next.getDay() === 0 || next.getDay() === 6);

  return next;
}

function applyDeterministicPhraseOverrides(
  reminder: Date,
  normalizedText: string,
  now: Date,
): { reminder: Date; usedRule: string | null; allDay: boolean } {
  const normalizedLower = normalizedText.toLowerCase();

  if (/\bnext business day\b/i.test(normalizedLower)) {
    return {
      reminder: nextBusinessDayAt(9, 0, now),
      usedRule: "next_business_day",
      allDay: false,
    };
  }

  if (/\b(eod|end of day)\b/i.test(normalizedLower)) {
    const next = new Date(now);
    next.setHours(18, 0, 0, 0);
    if (next.getTime() <= now.getTime()) {
      next.setDate(next.getDate() + 1);
    }

    return {
      reminder: next,
      usedRule: "eod",
      allDay: false,
    };
  }

  if (/\bthis evening\b/i.test(normalizedLower)) {
    const next = new Date(now);
    next.setHours(19, 0, 0, 0);
    if (next.getTime() <= now.getTime()) {
      next.setDate(next.getDate() + 1);
    }

    return {
      reminder: next,
      usedRule: "this_evening",
      allDay: false,
    };
  }

  if (/\btonight\b/i.test(normalizedLower)) {
    const next = new Date(now);
    next.setHours(20, 0, 0, 0);
    if (next.getTime() <= now.getTime()) {
      next.setDate(next.getDate() + 1);
    }

    return {
      reminder: next,
      usedRule: "tonight",
      allDay: false,
    };
  }

  if (ALL_DAY_HINT_REGEX.test(normalizedLower)) {
    const next = new Date(reminder);
    next.setHours(9, 0, 0, 0);
    return {
      reminder: next,
      usedRule: "all_day_hint",
      allDay: true,
    };
  }

  return {
    reminder,
    usedRule: null,
    allDay: false,
  };
}

function estimateConfidence(params: {
  parsed: (ReturnType<typeof parse>)[number];
  usedRule: string | null;
  hadExplicitTime: boolean;
  isAmbiguous: boolean;
  allDay: boolean;
}): number {
  let confidence = 0.55;

  if (params.parsed.start.isCertain("day")) confidence += 0.15;
  if (params.parsed.start.isCertain("month")) confidence += 0.08;
  if (params.parsed.start.isCertain("year")) confidence += 0.08;
  if (params.hadExplicitTime || params.parsed.start.isCertain("hour")) confidence += 0.18;
  if (params.usedRule) confidence += 0.1;
  if (params.allDay) confidence += 0.05;
  if (params.isAmbiguous) confidence -= 0.25;

  return Math.min(Math.max(confidence, 0), 0.99);
}

function noReminder(cleanedContent: string, debug: string): ParsedReminder {
  return {
    cleanedContent,
    reminderTime: null,
    previewLabel: null,
    confidence: 0,
    isAmbiguous: false,
    ambiguityReason: null,
    allDay: false,
    durationMinutes: null,
    debug,
  };
}

export function parseReminderSyntax(content: string): ParsedReminder {
  const trimmed = content.trim();
  if (!trimmed) {
    return noReminder("", "Empty input");
  }

  const hasExplicitMarker = EXPLICIT_MARKER_REGEX.test(content);
  if (!hasExplicitMarker && !TEMPORAL_HINT_REGEX.test(content)) {
    return noReminder(trimmed, "No temporal hints detected");
  }

  const now = new Date();
  const bracketMatch = content.match(BRACKET_MENTION_REGEX);

  if (bracketMatch) {
    const token = bracketMatch[1].trim();
    let reminder = parseShortcutKeyword(token, now);
    const parsed = reminder ? null : pickBestParsedResult(parse(token, now, { forwardDate: true }));

    if (!reminder) {
      reminder = parsed?.start?.date() ?? null;
    }

    if (!reminder) {
      return noReminder(trimmed, `Bracket token not parseable: ${token}`);
    }

    const cleanedContent = content.replace(bracketMatch[0], " ").replace(/\s{2,}/g, " ").trim() || trimmed;
    const confidence = parsed ? estimateConfidence({
      parsed,
      usedRule: null,
      hadExplicitTime: parsed.start.isCertain("hour"),
      isAmbiguous: !parsed.start.isCertain("hour"),
      allDay: false,
    }) : 0.88;

    return {
      cleanedContent,
      reminderTime: toLocalIso(reminder),
      previewLabel: reminder.toLocaleString(),
      confidence,
      isAmbiguous: !token.match(/\d|am|pm|today|tomorrow|tonight/i),
      ambiguityReason: !token.match(/\d|am|pm/i) ? "No time specified. Choose a time." : null,
      allDay: false,
      durationMinutes: resolveDurationMinutes(token),
      debug: `Bracket token parsed: ${token}`,
    };
  }

  const normalized = normalizeReminderInput(content);
  if (!normalized) {
    return noReminder(trimmed, "Normalized input empty");
  }

  const parsed = pickBestParsedResult(parse(normalized, now, { forwardDate: true }));
  if (!parsed) {
    return noReminder(trimmed, `Parse failed for normalized text: ${normalized}`);
  }

  const sourceText = parsed.text?.trim() ?? "";
  let reminder = parsed.start?.date() ?? null;
  if (!reminder) {
    return noReminder(trimmed, "Parser returned no date");
  }

  reminder = applyShortcutOverrideIfNeeded(
    reminder,
    sourceText,
    content,
    parsed.start?.isCertain("hour") ?? false,
  );

  const explicitTime = extractExplicitTime(normalized);
  reminder = applyExplicitTimeIfNeeded(reminder, normalized, parsed);
  reminder = applyOrdinalDayIfNeeded(reminder, normalized, parsed, now);

  const deterministic = applyDeterministicPhraseOverrides(reminder, normalized, now);
  reminder = deterministic.reminder;

  const hasResolvedTime =
    Boolean(explicitTime) ||
    parsed.start.isCertain("hour") ||
    ["eod", "this_evening", "tonight", "next_business_day"].includes(deterministic.usedRule ?? "");

  const isAmbiguous = !deterministic.allDay && !hasResolvedTime;
  const confidence = estimateConfidence({
    parsed,
    usedRule: deterministic.usedRule,
    hadExplicitTime: Boolean(explicitTime),
    isAmbiguous,
    allDay: deterministic.allDay,
  });

  const cleanedContent = hasExplicitMarker
    ? removeOrdinalPhrase(removeParsedPhrase(normalized, sourceText))
    : trimmed;

  const durationMinutes = resolveDurationMinutes(normalized);

  const debugPayload = {
    input: content,
    normalized,
    sourceText,
    resolved: reminder.toISOString(),
    explicitMarker: hasExplicitMarker,
    explicitTime: explicitTime ? `${String(explicitTime.hour).padStart(2, "0")}:${String(explicitTime.minute).padStart(2, "0")}` : null,
    usedRule: deterministic.usedRule,
    allDay: deterministic.allDay,
    ambiguous: isAmbiguous,
    confidence,
  };

  return {
    cleanedContent,
    reminderTime: toLocalIso(reminder),
    previewLabel: deterministic.allDay
      ? `All day - ${reminder.toLocaleDateString()}`
      : reminder.toLocaleString(),
    confidence,
    isAmbiguous,
    ambiguityReason: isAmbiguous ? "No time specified. Pick a time or type one." : null,
    allDay: deterministic.allDay,
    durationMinutes,
    debug: JSON.stringify(debugPayload, null, 2),
  };
}
