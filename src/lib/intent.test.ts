import { describe, expect, it } from "vitest";
import { classifyIntent } from "./intent";

describe("classifyIntent", () => {
  it("classifies imperative openers as tasks with the verb as the signal", () => {
    expect(classifyIntent("buy milk")).toEqual({ intent: "task", signal: 'starts with "buy"' });
    expect(classifyIntent("Call the bank about the card").intent).toBe("task");
    expect(classifyIntent("pay rent").intent).toBe("task");
  });

  it("classifies to-do phrasing as tasks wherever it appears", () => {
    expect(classifyIntent("don't forget the passport").intent).toBe("task");
    expect(classifyIntent("I need to renew my visa soon").intent).toBe("task");
    expect(classifyIntent("things to-do before friday").intent).toBe("task");
  });

  it("classifies checklists as tasks even multi-line", () => {
    const result = classifyIntent("- [ ] pack bags\n- [ ] print tickets\n- [x] book cab");
    expect(result).toEqual({ intent: "task", signal: "has a checklist" });
  });

  it("classifies links, note openers, and questions as notes", () => {
    expect(classifyIntent("check out https://example.com/article").intent).toBe("note");
    expect(classifyIntent("idea: capture app for musicians")).toEqual({
      intent: "note",
      signal: 'starts with "idea"',
    });
    expect(classifyIntent("what if routing learned from corrections?").intent).toBe("note");
  });

  it("classifies long-form text as notes", () => {
    const paragraphs = "line one\nline two\nline three";
    expect(classifyIntent(paragraphs).intent).toBe("note");
    expect(classifyIntent("a".repeat(201)).intent).toBe("note");
  });

  it("stays unsure when nothing is confident", () => {
    expect(classifyIntent("project phoenix").intent).toBe("unsure");
    expect(classifyIntent("call").intent).toBe("unsure");
    expect(classifyIntent("").intent).toBe("unsure");
    expect(classifyIntent("meeting recap with the design team").intent).toBe("unsure");
  });

  it("does not let an imperative opener hijack multi-line or link content", () => {
    expect(classifyIntent("buy milk\nalso thoughts on the roadmap\nand more context here").intent).toBe(
      "note",
    );
    expect(classifyIntent("read https://example.com/post").intent).toBe("note");
  });
});
