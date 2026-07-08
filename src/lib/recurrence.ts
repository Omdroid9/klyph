export interface ParsedRecurrenceRule {
  interval: number;
  unit: "second" | "minute" | "hour" | "day" | "week";
}

export function parseStoredRecurrenceRule(rule: string | null | undefined): ParsedRecurrenceRule | null {
  if (!rule) {
    return null;
  }

  const [kind, intervalRaw, unitRaw] = rule.split(":");
  const interval = Number(intervalRaw);
  if (
    kind !== "every" ||
    !Number.isFinite(interval) ||
    interval <= 0 ||
    !["second", "minute", "hour", "day", "week"].includes(unitRaw)
  ) {
    return null;
  }

  return {
    interval: Math.floor(interval),
    unit: unitRaw as ParsedRecurrenceRule["unit"],
  };
}

export function recurrenceLabelFromRule(rule: string | null | undefined): string | null {
  const parsed = parseStoredRecurrenceRule(rule);
  if (!parsed) {
    return null;
  }

  return `Every ${parsed.interval} ${parsed.interval === 1 ? parsed.unit : `${parsed.unit}s`}`;
}

export function addRecurrenceInterval(base: Date, rule: string): Date | null {
  const parsed = parseStoredRecurrenceRule(rule);
  if (!parsed) {
    return null;
  }

  const next = new Date(base);
  switch (parsed.unit) {
    case "second":
      next.setSeconds(next.getSeconds() + parsed.interval);
      break;
    case "minute":
      next.setMinutes(next.getMinutes() + parsed.interval);
      break;
    case "hour":
      next.setHours(next.getHours() + parsed.interval);
      break;
    case "day":
      next.setDate(next.getDate() + parsed.interval);
      break;
    case "week":
      next.setDate(next.getDate() + parsed.interval * 7);
      break;
  }

  return next;
}

export function nextRecurrenceAfter(base: Date, rule: string, now = new Date()): Date | null {
  let next = addRecurrenceInterval(base, rule);
  let guard = 0;
  while (next && next.getTime() <= now.getTime() && guard < 10_000) {
    next = addRecurrenceInterval(next, rule);
    guard += 1;
  }
  return next;
}

export function toLocalIso(input: Date): string {
  const timezoneOffset = input.getTimezoneOffset() * 60_000;
  return new Date(input.getTime() - timezoneOffset).toISOString().slice(0, 19);
}
