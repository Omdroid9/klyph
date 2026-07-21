import { describe, expect, it } from "vitest";
import { appleNoteBody } from "./noteFormat";

const FOOTER = "<div><br></div><div><i>Inbox • work</i></div>";

describe("appleNoteBody", () => {
  it("keeps plain lines as divs", () => {
    expect(appleNoteBody("first thought\nsecond thought", "Inbox", "work")).toBe(
      `<div>first thought</div><div>second thought</div>${FOOTER}`,
    );
  });

  it("groups dash lines into one native bullet list", () => {
    expect(appleNoteBody("text 1\n- text 2\n- text 3\n- text 4", "Inbox", "work")).toBe(
      `<div>text 1</div><ul><li>text 2</li><li>text 3</li><li>text 4</li></ul>${FOOTER}`,
    );
  });

  it("renders checkbox syntax with box glyphs", () => {
    expect(appleNoteBody("- [ ] buy milk\n- [x] call bank", "Inbox", "work")).toBe(
      `<ul><li>☐ buy milk</li><li>☑ call bank</li></ul>${FOOTER}`,
    );
  });

  it("keeps numbered lines as an ordered list", () => {
    expect(appleNoteBody("steps:\n1. unplug it\n2. plug it back in", "Inbox", "work")).toBe(
      `<div>steps:</div><ol><li>unplug it</li><li>plug it back in</li></ol>${FOOTER}`,
    );
  });

  it("splits separate lists when prose interrupts", () => {
    expect(appleNoteBody("- a\nmiddle\n- b", "Inbox", "work")).toBe(
      `<ul><li>a</li></ul><div>middle</div><ul><li>b</li></ul>${FOOTER}`,
    );
  });

  it("escapes HTML in every line kind", () => {
    expect(appleNoteBody("a < b\n- 1 & 2", "My <list>", "work")).toBe(
      `<div>a &lt; b</div><ul><li>1 &amp; 2</li></ul><div><br></div><div><i>My &lt;list&gt; • work</i></div>`,
    );
  });

  it("keeps blank lines as spacing", () => {
    expect(appleNoteBody("one\n\ntwo", "Inbox", "work")).toBe(
      `<div>one</div><div><br></div><div>two</div>${FOOTER}`,
    );
  });
});
