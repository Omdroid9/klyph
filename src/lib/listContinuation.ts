/**
 * List continuation for the capture textarea (⇧Enter = newline).
 *
 * Fires only when the caret sits on a line the user already made a list
 * item — a plain line never grows a prefix, so nothing the user didn't
 * type ever appears. Newline on an empty item removes the prefix instead
 * (the standard "press again to exit the list" gesture).
 */

const CHECKBOX_PREFIX_REGEX = /^(\s*)- \[[ xX]\]\s(.*)$/;
const BULLET_PREFIX_REGEX = /^(\s*)([-*])\s(.*)$/;
const ORDERED_PREFIX_REGEX = /^(\s*)(\d+)\.\s(.*)$/;

export interface ContinuedValue {
  value: string;
  cursor: number;
}

export function continueListOnNewline(value: string, cursor: number): ContinuedValue | null {
  const lineStart = value.lastIndexOf("\n", cursor - 1) + 1;
  const lineEnd = value.indexOf("\n", cursor);
  const line = value.slice(lineStart, lineEnd === -1 ? value.length : lineEnd);

  let prefix: string | null = null;
  let content = "";

  const checkbox = line.match(CHECKBOX_PREFIX_REGEX);
  const bullet = checkbox ? null : line.match(BULLET_PREFIX_REGEX);
  const ordered = checkbox || bullet ? null : line.match(ORDERED_PREFIX_REGEX);

  if (checkbox) {
    prefix = `${checkbox[1]}- [ ] `;
    content = checkbox[2];
  } else if (bullet) {
    prefix = `${bullet[1]}${bullet[2]} `;
    content = bullet[3];
  } else if (ordered) {
    prefix = `${ordered[1]}${Number(ordered[2]) + 1}. `;
    content = ordered[3];
  }

  if (prefix === null) {
    return null;
  }

  if (content.trim().length === 0) {
    // Empty item: exit the list by removing the prefix the user just left.
    const next = value.slice(0, lineStart) + value.slice(cursor);
    return { value: next, cursor: lineStart };
  }

  const next = `${value.slice(0, cursor)}\n${prefix}${value.slice(cursor)}`;
  return { value: next, cursor: cursor + 1 + prefix.length };
}
