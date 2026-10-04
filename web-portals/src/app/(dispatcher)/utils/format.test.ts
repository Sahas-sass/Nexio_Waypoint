import { describe, expect, it } from "vitest";
import { formatDateLabel, getStoreInitial, isoDate, one, shortTime, timeAgo } from "./format";

describe("format utils", () => {
  it("getStoreInitial", () => {
    expect(getStoreInitial("fresh Store #22")).toBe("F");
    expect(getStoreInitial("  ")).toBe("");
    expect(getStoreInitial(null)).toBe("");
  });
  it("one unwraps embedded relations", () => {
    expect(one({ a: 1 })).toEqual({ a: 1 });
    expect(one([{ a: 1 }, { a: 2 }])).toEqual({ a: 1 });
    expect(one([])).toBeNull();
    expect(one(null)).toBeNull();
  });
  it("shortTime", () => {
    expect(shortTime("08:30:00")).toBe("08:30");
    expect(shortTime("7:05")).toBe("07:05");
    expect(shortTime(null)).toBeNull();
    expect(shortTime("soon")).toBeNull();
  });
  it("isoDate with offsets across month ends", () => {
    expect(isoDate(new Date(2026, 9, 4))).toBe("2026-10-04");
    expect(isoDate(new Date(2026, 9, 31), 1)).toBe("2026-11-01");
  });
  it("formatDateLabel", () => {
    expect(formatDateLabel("2026-10-05")).toMatch(/Mon.*5.*Oct/);
    expect(formatDateLabel("bad")).toBe("bad");
  });
  it("timeAgo", () => {
    const now = new Date("2026-10-04T10:00:00Z");
    expect(timeAgo(null, now)).toBe("No updates yet");
    expect(timeAgo("x", now)).toBe("No updates yet");
    expect(timeAgo("2026-10-04T09:59:50Z", now)).toBe("Updated just now");
    expect(timeAgo("2026-10-04T09:54:00Z", now)).toBe("Last update 6 min ago");
    expect(timeAgo("2026-10-04T07:00:00Z", now)).toBe("Last update 3 h ago");
    expect(timeAgo("2026-10-01T10:00:00Z", now)).toBe("Last update 3 d ago");
  });
});
