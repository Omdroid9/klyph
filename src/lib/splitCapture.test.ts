import { describe, expect, it } from "vitest";
import { noteContentFromSplit, splitCaptureLines } from "./splitCapture";

describe("splitCaptureLines", () => {
  it("splits a meeting-notes dump into reminders and note lines", () => {
    const split = splitCaptureLines(
      [
        "Meeting notes:",
        "- do x and y tomorrow",
        "- remind me to send the recap",
        "- this is a thought",
        "- random thought",
      ].join("\n"),
    );

    expect(split).not.toBeNull();
    expect(split!.heading).toBe("Meeting notes");
    expect(split!.reminders.map((line) => line.content)).toEqual([
      "do x and y tomorrow",
      "remind me to send the recap",
    ]);
    expect(split!.notes.map((line) => line.content)).toEqual([
      "this is a thought",
      "random thought",
    ]);
  });

  it("keeps the reminder text but strips the command phrasing", () => {
    const split = splitCaptureLines(
      ["- remind me to call the bank", "- just an observation"].join("\n"),
    );

    expect(split).not.toBeNull();
    expect(split!.reminders[0].cleanedContent).toBe("call the bank");
  });

  it("treats checkboxes as actions even without a time", () => {
    const split = splitCaptureLines(
      ["- [ ] file the expense report", "- context from standup"].join("\n"),
    );

    expect(split).not.toBeNull();
    expect(split!.reminders).toHaveLength(1);
    expect(split!.reminders[0].content).toBe("file the expense report");
  });

  it("returns null when every line is the same kind", () => {
    expect(splitCaptureLines("- thought one\n- thought two")).toBeNull();
    // Two timed tasks (no event nouns) are one kind — no split.
    expect(splitCaptureLines("- call mom tomorrow at 5pm\n- pay rent friday 9am")).toBeNull();
    expect(splitCaptureLines("single line")).toBeNull();
  });

  it("splits an event + reminder mix even with no prose lines", () => {
    const split = splitCaptureLines(
      ["- dentist friday 9am", "- pay rent tomorrow at noon"].join("\n"),
    );

    expect(split).not.toBeNull();
    expect(split!.events.map((line) => line.content)).toEqual(["dentist friday 9am"]);
    expect(split!.reminders.map((line) => line.content)).toEqual(["pay rent tomorrow at noon"]);
  });

  it("routes the reported 4-line mix: meetings to events, errands to reminders", () => {
    // Regression for the reported capture. With weekend/after-work parsing
    // and per-line event classification, every line lands where its meaning
    // says: meetings (slots) -> events, errands/deadlines -> reminders.
    const split = splitCaptureLines(
      [
        "- groceries after work",
        "- make sure to do the laundry by tonight",
        "- Meeting with Mark tomorrow at 2pm",
        "- Lets meet with Sundar this weekend to pitch",
      ].join("\n"),
    );

    expect(split).not.toBeNull();
    expect(split!.events.map((line) => line.content)).toEqual([
      "Meeting with Mark tomorrow at 2pm",
      "Lets meet with Sundar this weekend to pitch",
    ]);
    expect(split!.reminders.map((line) => line.content)).toEqual([
      "groceries after work",
      "make sure to do the laundry by tonight",
    ]);
    expect(split!.notes).toHaveLength(0);
  });

  it("keeps a deadline line ('by tonight') as a reminder, not an event", () => {
    const split = splitCaptureLines(
      ["- submit the report by tonight", "- context from standup"].join("\n"),
    );

    expect(split).not.toBeNull();
    expect(split!.events).toHaveLength(0);
    expect(split!.reminders.map((line) => line.content)).toEqual(["submit the report by tonight"]);
  });

  it("rebuilds the note half with its heading", () => {
    const split = splitCaptureLines(
      ["Standup:", "- ship the fix friday 10am", "- morale is good"].join("\n"),
    );

    expect(split).not.toBeNull();
    expect(noteContentFromSplit(split!)).toBe("Standup:\n- morale is good");
  });
});
