import { describe, it, expect } from "vitest";
import {
  parseTimeToMinutes,
  isTripDispatched,
  isTripReady,
  summarizeQueue,
  tripProgress,
  getEarliestCutoffTrip,
  filterTrips,
} from "./tripQueueHelpers";
import { makePallet, makeStop, makeTrip } from "./testFixtures";

describe("parseTimeToMinutes", () => {
  it("parses 12-hour times", () => {
    expect(parseTimeToMinutes("05:45 AM")).toBe(345);
    expect(parseTimeToMinutes("12:00 AM")).toBe(0);
    expect(parseTimeToMinutes("12:30 PM")).toBe(750);
    expect(parseTimeToMinutes("1:05 pm")).toBe(785);
  });
  it("sorts missing/invalid values last", () => {
    expect(parseTimeToMinutes(undefined)).toBe(999999);
    expect(parseTimeToMinutes(null)).toBe(999999);
    expect(parseTimeToMinutes("soon")).toBe(999999);
  });
});

describe("status helpers", () => {
  it("classifies statuses", () => {
    expect(isTripDispatched("en_route")).toBe(true);
    expect(isTripDispatched("completed")).toBe(true);
    expect(isTripDispatched("loading")).toBe(false);
    expect(isTripReady("planning")).toBe(true);
    expect(isTripReady("loading")).toBe(false);
  });
  it("summarizes the queue", () => {
    const trips = [makeTrip({ status: "loading" }), makeTrip({ status: "planning" }), makeTrip({ status: "en_route" })];
    expect(summarizeQueue(trips)).toEqual({ loading: 1, ready: 1, dispatched: 1 });
  });
});

describe("tripProgress", () => {
  it("computes verified/total/percent", () => {
    const trip = makeTrip({
      stops: [makeStop({ pallets: [makePallet({ verified: true }), makePallet({ id: "p2" }), makePallet({ id: "p3" })] })],
    });
    expect(tripProgress(trip)).toEqual({ verified: 1, total: 3, percent: 33 });
    expect(tripProgress(makeTrip())).toEqual({ verified: 0, total: 0, percent: 0 });
  });
});

describe("getEarliestCutoffTrip", () => {
  const a = makeTrip({ id: "a", bay: "Bay 01", cutoffTime: "07:00 AM" });
  const b = makeTrip({ id: "b", bay: "Bay 02", cutoffTime: "06:00 AM" });
  const gone = makeTrip({ id: "c", status: "en_route", cutoffTime: "05:00 AM" });
  it("returns the earliest pending cut-off", () => {
    expect(getEarliestCutoffTrip([a, b, gone])?.id).toBe("b");
  });
  it("respects the bay filter and falls back to all pending", () => {
    expect(getEarliestCutoffTrip([a, b], "Bay 01")?.id).toBe("a");
    expect(getEarliestCutoffTrip([a, b], "Bay 09")?.id).toBe("b");
  });
  it("returns null when everything is dispatched", () => {
    expect(getEarliestCutoffTrip([gone])).toBeNull();
  });
});

describe("filterTrips", () => {
  const trips = [
    makeTrip({ id: "a", status: "loading", bay: "Bay 01", driverName: "Kasun" }),
    makeTrip({ id: "b", status: "planning", bay: "Bay 02", plateNumber: "VAN-012" }),
    makeTrip({ id: "c", status: "completed", bay: "Bay 01" }),
  ];
  const ids = (t: { id: string }[]) => t.map((x) => x.id);
  it("filters by status bucket", () => {
    expect(ids(filterTrips(trips, "all", "all", ""))).toEqual(["a", "b", "c"]);
    expect(ids(filterTrips(trips, "loading", "all", ""))).toEqual(["a"]);
    expect(ids(filterTrips(trips, "ready", "all", ""))).toEqual(["b"]);
    expect(ids(filterTrips(trips, "dispatched", "all", ""))).toEqual(["c"]);
  });
  it("filters by bay and search", () => {
    expect(ids(filterTrips(trips, "all", "Bay 01", ""))).toEqual(["a", "c"]);
    expect(ids(filterTrips(trips, "all", "all", "van-0"))).toEqual(["b"]);
    expect(ids(filterTrips(trips, "all", "all", "kasun"))).toEqual(["a"]);
  });
});
