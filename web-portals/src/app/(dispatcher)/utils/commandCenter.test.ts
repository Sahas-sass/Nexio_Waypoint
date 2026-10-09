import { describe, expect, it } from "vitest";
import { buildAlerts, buildCommandCenterData, buildFleetBreakdown, earliestEta, type CommandTripRow } from "./commandCenter";
import type { DispatcherOrder } from "../services/types";

const vehicleRow = (id: string, extra = {}) => ({
  id,
  registration_number: id.toUpperCase(),
  vehicle_type: "Truck",
  max_weight_kg: 1000,
  max_volume_m3: 10,
  is_refrigerated: false,
  ...extra,
});
const trip = (id: string, status: string, load: [number, number], extra: Partial<CommandTripRow> = {}): CommandTripRow => ({
  id,
  status,
  trip_number: id,
  departure_time: null,
  eta_time: null,
  delay_minutes: 0,
  vehicles: vehicleRow(`v-${id}`),
  trip_stops: [{ orders: { total_weight_kg: load[0], total_volume_m3: load[1] } }],
  ...extra,
});
const order = (o: Partial<DispatcherOrder> & { status: string }) =>
  ({
    id: "o1",
    orderNumber: "ORD-1",
    storeId: "s1",
    storeName: "Fresh Store #18",
    storeInitial: "F",
    windowStart: null,
    windowEnd: null,
    totalVolumeM3: 1,
    totalWeightKg: 10,
    priority: "High",
    tempRequirement: "chilled",
    deliveryWindow: "07:00 - 08:00",
    ...o,
  }) as DispatcherOrder & { status: string };

describe("earliestEta", () => {
  it("returns the earliest parsable ETA", () => {
    expect(earliestEta(["9:18 AM", null, "07:42 AM", "1:00 PM", "junk"])).toBe("07:42 AM");
    expect(earliestEta([null])).toBeNull();
  });
});

describe("buildFleetBreakdown", () => {
  it("computes utilisation per trip and skips trips without a vehicle", () => {
    const fleet = buildFleetBreakdown([trip("t1", "en_route", [900, 5]), trip("t2", "loading", [0, 0], { vehicles: null })]);
    expect(fleet).toEqual([
      { id: "t1", plate: "V-T1", model: "Truck", weightPercent: 90, volumePercent: 50, isRefrigerated: false, image: "/truck_heavy.jpg" },
    ]);
  });
});

describe("buildAlerts", () => {
  it("raises capacity, earliest-window and allocation review alerts", () => {
    const fleet = buildFleetBreakdown([trip("t1", "en_route", [1000, 2]), trip("t2", "en_route", [100, 1])]);
    const alerts = buildAlerts(fleet, [order({ status: "pending", windowStart: "07:00" })], "2026-10-05");
    expect(alerts.map((a) => a.type)).toEqual(["capacity", "time", "review"]);
    expect(alerts[0]).toMatchObject({ level: "critical", description: "V-T1 is at 100% of its weight limit" });
    expect(alerts[1].title).toBe("Earliest window 07:00");
    expect(alerts[2].description).toMatch(/^1 order for /);
  });
  it("is empty when nothing needs attention", () => {
    expect(buildAlerts([], [], "2026-10-05")).toEqual([]);
  });
});

describe("buildCommandCenterData", () => {
  it("aggregates KPIs from real rows only", () => {
    const data = buildCommandCenterData({
      planningDate: "2026-10-05",
      plannedOrders: [order({ id: "a", status: "pending" }), order({ id: "b", status: "assigned" })],
      deferredCount: 4,
      activeVehicleCount: 8,
      todaysTrips: [
        trip("t1", "en_route", [500, 5], { eta_time: "7:42 AM" }),
        trip("t2", "en_route", [0, 5], { eta_time: "9:18 AM", delay_minutes: 12 }),
        trip("t3", "loading", [0, 0]),
        trip("t4", "completed", [0, 0]),
      ],
    });
    expect(data).toMatchObject({
      totalOrders: 2,
      pendingOrders: 1,
      fleetCapacityPercent: 25,
      vehiclesReadyCount: 5,
      totalVehiclesCount: 8,
      pendingDeferralsCount: 4,
      firstEta: "7:42 AM",
      activeRoutesCount: 2,
      onTimeRatePercent: 67,
    });
    expect(data.orderQueue.map((o) => o.status)).toEqual(["Pending", "Assigned"]);
  });
  it("returns null KPIs when there are no trips", () => {
    const data = buildCommandCenterData({ planningDate: "2026-10-05", plannedOrders: [], deferredCount: 0, activeVehicleCount: 0, todaysTrips: [] });
    expect(data.fleetCapacityPercent).toBeNull();
    expect(data.onTimeRatePercent).toBeNull();
    expect(data.firstEta).toBeNull();
  });
});
