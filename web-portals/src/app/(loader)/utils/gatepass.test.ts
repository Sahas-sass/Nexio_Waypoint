import { describe, it, expect, vi, afterEach } from "vitest";
import { createGatepassPayload, generateGatepassQrDataUrl } from "./gatepass";
import { makeStop, makeTrip } from "./testFixtures";

afterEach(() => vi.useRealTimers());

describe("createGatepassPayload", () => {
  it("builds the payload from the trip and seal details", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-10-04T06:00:00Z"));
    const trip = makeTrip({ stops: [makeStop(), makeStop({ stopId: "s2" })] });
    expect(createGatepassPayload(trip, "SEAL-1", "Loader A", true)).toEqual({
      passType: "WAYPOINT_GATEPASS_DISPATCH",
      tripNumber: "TRIP 1",
      plateNumber: "TRK-1",
      sealNumber: "SEAL-1",
      driver: "Driver",
      bay: "Bay 01",
      dispatchedAt: "2026-10-04T06:00:00.000Z",
      signedBy: "Loader A",
      storesCount: 2,
      hasDiscrepancy: true,
    });
  });
});

describe("generateGatepassQrDataUrl", () => {
  it("returns a PNG data URL", async () => {
    const url = await generateGatepassQrDataUrl(createGatepassPayload(makeTrip(), "S-1", "L", false));
    expect(url.startsWith("data:image/png;base64,")).toBe(true);
  });
});
