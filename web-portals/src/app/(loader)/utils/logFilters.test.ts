import { describe, it, expect } from "vitest";
import { filterLogs, summarizeLogs } from "./logFilters";
import { makeLog } from "./testFixtures";

const now = new Date("2026-10-04T12:00:00");
const today = makeLog({ id: "a", dispatchedAtIso: "2026-10-04T07:00:00", driverName: "Kasun" });
const past = makeLog({ id: "b", dispatchedAtIso: "2026-10-02T07:00:00", sealNumber: "XYZ-9", driverName: "Nimal" });

describe("filterLogs", () => {
  it("filters by dispatch day", () => {
    expect(filterLogs([today, past], "all", "", now).map((l) => l.id)).toEqual(["a", "b"]);
    expect(filterLogs([today, past], "today", "", now).map((l) => l.id)).toEqual(["a"]);
    expect(filterLogs([today, past], "past", "", now).map((l) => l.id)).toEqual(["b"]);
  });
  it("searches trip, plate, driver, seal and stores case-insensitively", () => {
    expect(filterLogs([today, past], "all", "xyz", now).map((l) => l.id)).toEqual(["b"]);
    expect(filterLogs([today, past], "all", "  KASUN ", now).map((l) => l.id)).toEqual(["a"]);
    expect(filterLogs([today, past], "all", "store b", now)).toHaveLength(2);
    expect(filterLogs([today, past], "today", "nimal", now)).toHaveLength(0);
  });
});

describe("summarizeLogs", () => {
  it("aggregates real counts", () => {
    const partial = makeLog({ totalPallets: 5, verifiedPallets: 3, hasDiscrepancy: true });
    expect(summarizeLogs([today, partial])).toEqual({
      tripCount: 2,
      totalPallets: 9,
      verifiedPallets: 7,
      fullyVerifiedTrips: 1,
      discrepancyCount: 1,
    });
  });
  it("returns zeros for no logs", () => {
    expect(summarizeLogs([])).toEqual({ tripCount: 0, totalPallets: 0, verifiedPallets: 0, fullyVerifiedTrips: 0, discrepancyCount: 0 });
  });
});
