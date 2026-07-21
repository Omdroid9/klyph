import { describe, expect, it } from "vitest";
import { continueListOnNewline } from "./listContinuation";

const atEnd = (value: string) => continueListOnNewline(value, value.length);

describe("continueListOnNewline", () => {
  it("never adds a prefix after a plain line", () => {
    expect(atEnd("text 1")).toBeNull();
    expect(atEnd("first line\nsecond line")).toBeNull();
  });

  it("continues a dash list the user started", () => {
    expect(atEnd("text 1\n- text 2")).toEqual({
      value: "text 1\n- text 2\n- ",
      cursor: "text 1\n- text 2\n- ".length,
    });
  });

  it("continues a star list with the same marker", () => {
    expect(atEnd("* item")).toEqual({ value: "* item\n* ", cursor: "* item\n* ".length });
  });

  it("continues a checklist with an unchecked box, even after a checked one", () => {
    expect(atEnd("- [x] done thing")).toEqual({
      value: "- [x] done thing\n- [ ] ",
      cursor: "- [x] done thing\n- [ ] ".length,
    });
  });

  it("increments numbered lists", () => {
    expect(atEnd("1. unplug it")).toEqual({
      value: "1. unplug it\n2. ",
      cursor: "1. unplug it\n2. ".length,
    });
  });

  it("preserves indentation", () => {
    expect(atEnd("  - nested")).toEqual({
      value: "  - nested\n  - ",
      cursor: "  - nested\n  - ".length,
    });
  });

  it("exits the list when the current item is empty", () => {
    expect(atEnd("- text 2\n- ")).toEqual({
      value: "- text 2\n",
      cursor: "- text 2\n".length,
    });
  });

  it("carries the rest of the line into the new item when mid-line", () => {
    const value = "- alpha beta";
    const cursor = "- alpha".length;
    expect(continueListOnNewline(value, cursor)).toEqual({
      value: "- alpha\n-  beta",
      cursor: "- alpha\n- ".length,
    });
  });
});
