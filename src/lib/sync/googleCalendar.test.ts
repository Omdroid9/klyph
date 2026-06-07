import { afterEach, describe, expect, it, vi } from "vitest";

const httpPostJson = vi.fn();
const httpRequest = vi.fn();

vi.mock("../net/http", () => ({
  httpPostJson: (...args: unknown[]) => httpPostJson(...args),
  httpRequest: (...args: unknown[]) => httpRequest(...args),
}));

import { calendarEventId, createGoogleCalendarEvent } from "./googleCalendar";

afterEach(() => {
  vi.clearAllMocks();
});

describe("calendarEventId", () => {
  it("is deterministic for the same capture id", () => {
    const id = "7c9e6679-7425-40de-944b-e07fc1f90ae7";
    expect(calendarEventId(id)).toBe(calendarEventId(id));
  });

  it("produces a Google-valid base32hex id (a-v, 0-9, length >= 5)", () => {
    const id = calendarEventId("7C9E6679-7425-40DE-944B-E07FC1F90AE7");
    expect(id).toMatch(/^[a-v0-9]{5,1024}$/);
  });

  it("differs for different captures", () => {
    expect(calendarEventId("aaaaaaaa-0000-0000-0000-000000000000")).not.toBe(
      calendarEventId("bbbbbbbb-0000-0000-0000-000000000000"),
    );
  });
});

describe("createGoogleCalendarEvent idempotency", () => {
  const base = {
    accessToken: "ya29.x",
    calendarId: "primary",
    summary: "ship it",
    reminderTime: "2026-06-05T09:00:00",
    eventId: "fcdeadbeef",
  };

  it("sends the deterministic id in the payload", async () => {
    httpPostJson.mockResolvedValueOnce({});
    await createGoogleCalendarEvent(base);

    const [, payload] = httpPostJson.mock.calls[0];
    expect((payload as { id?: string }).id).toBe("fcdeadbeef");
  });

  it("treats a 409 conflict as success when an event id is set", async () => {
    httpPostJson.mockRejectedValueOnce(new Error("HTTP 409: duplicate"));
    await expect(createGoogleCalendarEvent(base)).resolves.toBeUndefined();
  });

  it("still throws on non-conflict errors", async () => {
    httpPostJson.mockRejectedValueOnce(new Error("HTTP 500: boom"));
    await expect(createGoogleCalendarEvent(base)).rejects.toThrow(/HTTP 500/);
  });

  it("does not swallow 409 when no event id is set", async () => {
    httpPostJson.mockRejectedValueOnce(new Error("HTTP 409: duplicate"));
    await expect(
      createGoogleCalendarEvent({ ...base, eventId: undefined }),
    ).rejects.toThrow(/HTTP 409/);
  });
});
