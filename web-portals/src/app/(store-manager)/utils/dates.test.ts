import { describe, expect, it } from "vitest";
import {
  addDays, colomboMinutes, colomboToday, cutoffStatus, earliestDeliveryDate, formatDate,
  formatDateTime, formatDuration, formatTime, formatWindow, greeting, headlineDate,
} from "./dates";

// 2026-10-04 10:00 UTC = 15:30 Colombo; 11:00 UTC = 16:30 Colombo
const before = new Date("2026-10-04T10:00:00Z");
const after = new Date("2026-10-04T11:00:00Z");

describe("colombo clock", () => {
  it("computes date and minutes in Colombo", () => {
    expect(colomboToday(before)).toBe("2026-10-04");
    expect(colomboMinutes(before)).toBe(15 * 60 + 30);
    expect(colomboToday(new Date("2026-10-04T19:00:00Z"))).toBe("2026-10-05");
  });
  it("adds days across month boundaries", () => {
    expect(addDays("2026-10-31", 1)).toBe("2026-11-01");
  });
});

describe("cutoff", () => {
  it("allows tomorrow before 16:00 and day after otherwise", () => {
    expect(earliestDeliveryDate(before)).toBe("2026-10-05");
    expect(earliestDeliveryDate(after)).toBe("2026-10-06");
  });
  it("reports remaining minutes and progress", () => {
    expect(cutoffStatus(before)).toEqual({ open: true, minutesRemaining: 30, progress: 930 / 960, earliestDate: "2026-10-05" });
    const closed = cutoffStatus(after);
    expect(closed.open).toBe(false);
    expect(closed.minutesRemaining).toBe(0);
    expect(closed.progress).toBe(1);
  });
});

describe("formatting", () => {
  it("formats durations", () => {
    expect(formatDuration(138)).toBe("2h 18m");
    expect(formatDuration(5)).toBe("5m");
  });
  it("formats dates without shifting", () => {
    expect(formatDate("2026-10-05")).toBe("Mon 5 Oct");
    expect(formatDate(null)).toBe("—");
    expect(formatDate("garbage")).toBe("—");
  });
  it("formats times in Colombo", () => {
    expect(formatTime("2026-10-04T02:35:00Z")).toBe("8:05 AM");
    expect(formatTime(null)).toBe("—");
    expect(formatTime("x")).toBe("—");
    expect(formatDateTime("2026-10-04T02:35:00Z")).toMatch(/4 Oct.*8:05/);
    expect(formatDateTime(undefined)).toBe("—");
    expect(formatDateTime("x")).toBe("—");
  });
  it("formats delivery windows", () => {
    expect(formatWindow("08:00:00", "08:30:00")).toBe("08:00 – 08:30");
    expect(formatWindow(null, "08:30:00")).toBe("Not set");
  });
  it("greets by Colombo hour and builds headline", () => {
    expect(greeting(new Date("2026-10-04T02:00:00Z"))).toBe("Good morning");
    expect(greeting(before)).toBe("Good afternoon");
    expect(greeting(new Date("2026-10-04T14:00:00Z"))).toBe("Good evening");
    expect(headlineDate(before)).toBe("SUNDAY • OCTOBER 4");
  });
});
