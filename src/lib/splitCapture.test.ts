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
    expect(splitCaptureLines("- call mom tomorrow at 5pm\n- dentist friday 9am")).toBeNull();
    expect(splitCaptureLines("single line")).toBeNull();
  });

  it("rebuilds the note half with its heading", () => {
    const split = splitCaptureLines(
      ["Standup:", "- ship the fix friday 10am", "- morale is good"].join("\n"),
    );

    expect(split).not.toBeNull();
    expect(noteContentFromSplit(split!)).toBe("Standup:\n- morale is good");
  });
});
