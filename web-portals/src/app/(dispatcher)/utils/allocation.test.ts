import { describe, expect, it } from "vitest";
import type { DispatcherOrder, PlanningVehicle } from "../services/types";
import {
  allocateOrders,
  deferralReasonFor,
  isScheduleFeasible,
  isVan,
  percentOf,
  planUtilisation,
  rejectReason,
  sortOrdersForAllocation,
  staticReject,
  timeToMinutes,
  travelMinutes,
} from "./allocation";
import { PLANNING } from "./constants";

const order = (o: Partial<DispatcherOrder> = {}): DispatcherOrder => ({
  id: "o1",
  orderNumber: "ORD-1",
  storeId: "s1",
  storeName: "Store",
  storeInitial: "S",
  storeDistrict: null,
  storeLat: null,
  storeLng: null,
  isVanOnly: false,
  windowStart: null,
  windowEnd: null,
  totalWeightKg: 100,
  totalVolumeM3: 1,
  itemCount: 10,
  tempRequirement: "ambient",
  priority: "Standard",
  deliveryWindow: "",
  targetDeliveryDate: "2026-10-05",
  ...o,
});

const vehicle = (v: Partial<PlanningVehicle> = {}): PlanningVehicle => ({
  id: "v1",
  plateNumber: "TRK-1",
  vehicleType: "Heavy Truck",
  maxWeightKg: 1000,
  maxVolumeM3: 10,
  isRefrigerated: false,
  image: "/truck_heavy.jpg",
  committedWeightKg: 0,
  committedVolumeM3: 0,
  departureTime: null,
  driverName: null,
  tripNumber: null,
  ...v,
});

const emptyPlan = (v: PlanningVehicle) => ({ vehicle: v, orders: [], weightKg: 0, volumeM3: 0 });

describe("timeToMinutes", () => {
  it("parses 24h, seconds and AM/PM formats", () => {
    expect(timeToMinutes("07:30")).toBe(450);
    expect(timeToMinutes("08:00:00")).toBe(480);
    expect(timeToMinutes("06:30 PM")).toBe(18 * 60 + 30);
    expect(timeToMinutes("12:15 AM")).toBe(15);
  });
  it("returns null for missing or invalid input", () => {
    expect(timeToMinutes(null)).toBeNull();
    expect(timeToMinutes("Before 8")).toBeNull();
    expect(timeToMinutes("25:00")).toBeNull();
  });
});

describe("vehicle compatibility", () => {
  it("detects vans by vehicle_type", () => {
    expect(isVan({ vehicleType: "Toyota HiAce Van", plateNumber: "X-1" })).toBe(true);
    expect(isVan({ vehicleType: "Nissan NV350 High-Roof Van", plateNumber: "X-2" })).toBe(true);
    expect(isVan({ vehicleType: "Toyota HiAce Urban Express", plateNumber: "VAN-012" })).toBe(true);
    expect(isVan({ vehicleType: "Isuzu NPR Heavy Freight", plateNumber: "TRK-024" })).toBe(false);
    expect(isVan({ vehicleType: "Caravan Truck", plateNumber: "TRK-001" })).toBe(false);
  });
  it("rejects chilled orders on non-refrigerated vehicles", () => {
    expect(staticReject(order({ tempRequirement: "chilled" }), vehicle())).toBe("temperature");
    expect(staticReject(order({ tempRequirement: "chilled" }), vehicle({ isRefrigerated: true }))).toBeNull();
  });
  it("rejects van-only outlets on trucks", () => {
    expect(staticReject(order({ isVanOnly: true }), vehicle())).toBe("van_only");
    expect(staticReject(order({ isVanOnly: true }), vehicle({ vehicleType: "Urban Van" }))).toBeNull();
  });
});

describe("rejectReason", () => {
  it("enforces weight including committed load", () => {
    const v = vehicle({ committedWeightKg: 950 });
    expect(rejectReason(order({ totalWeightKg: 100 }), emptyPlan(v))).toBe("weight");
  });
  it("enforces volume independently of weight", () => {
    const v = vehicle({ committedVolumeM3: 9.5 });
    expect(rejectReason(order({ totalVolumeM3: 1, totalWeightKg: 1 }), emptyPlan(v))).toBe("volume");
  });
  it("rejects when the store window has closed before arrival", () => {
    const v = vehicle({ departureTime: "09:00" });
    expect(rejectReason(order({ windowStart: "07:00", windowEnd: "08:00" }), emptyPlan(v))).toBe("window");
  });
  it("accepts a fitting order", () => {
    expect(rejectReason(order(), emptyPlan(vehicle()))).toBeNull();
  });
});

describe("travelMinutes / isScheduleFeasible", () => {
  it("falls back to the default leg time without coordinates", () => {
    expect(travelMinutes({ lat: null, lng: null }, { lat: 1, lng: 1 })).toBe(PLANNING.defaultLegMinutes);
  });
  it("estimates time from distance", () => {
    expect(travelMinutes({ lat: 6.953, lng: 79.882 }, { lat: 6.953, lng: 79.882 })).toBe(0);
    expect(travelMinutes({ lat: 6.953, lng: 79.882 }, { lat: 6.8724, lng: 79.8895 })).toBeGreaterThan(10);
  });
  it("waits for the window to open and fails when stops overrun later windows", () => {
    const early = order({ id: "a", windowStart: "07:00", windowEnd: "07:30" });
    const tight = order({ id: "b", windowStart: "07:00", windowEnd: "07:10" });
    expect(isScheduleFeasible([early], 6 * 60)).toBe(true);
    expect(isScheduleFeasible([early, tight], 6 * 60)).toBe(false);
  });
});

describe("sortOrdersForAllocation", () => {
  it("orders by priority, chilled first, earliest window end", () => {
    const sorted = sortOrdersForAllocation([
      order({ id: "low", priority: "Low" }),
      order({ id: "std-amb" }),
      order({ id: "std-chill", tempRequirement: "chilled" }),
      order({ id: "high-late", priority: "High", windowEnd: "11:00" }),
      order({ id: "high-early", priority: "High", windowEnd: "08:00" }),
    ]);
    expect(sorted.map((o) => o.id)).toEqual(["high-early", "high-late", "std-chill", "std-amb", "low"]);
  });
});

describe("deferralReasonFor", () => {
  it("maps rejection reasons to dispatcher deferral reasons", () => {
    expect(deferralReasonFor([])).toBe("Vehicle Unavailable");
    expect(deferralReasonFor(["temperature", "temperature"])).toBe("Reefer Shortage");
    expect(deferralReasonFor(["van_only"])).toBe("Vehicle Unavailable");
    expect(deferralReasonFor(["temperature", "window"])).toBe("Window Conflict");
    expect(deferralReasonFor(["weight", "temperature"])).toBe("Weight Limit");
    expect(deferralReasonFor(["volume", "weight"])).toBe("Fleet Capacity");
  });
});

describe("allocateOrders", () => {
  it("puts chilled orders only on reefers and keeps reefers free for chilled goods", () => {
    const truck = vehicle({ id: "truck" });
    const reefer = vehicle({ id: "reefer", isRefrigerated: true });
    const res = allocateOrders(
      [order({ id: "c", tempRequirement: "chilled" }), order({ id: "a" })],
      [reefer, truck],
    );
    const byId = Object.fromEntries(res.plans.map((p) => [p.vehicle.id, p.orders.map((o) => o.id)]));
    expect(byId.reefer).toEqual(["c"]);
    expect(byId.truck).toEqual(["a"]);
    expect(res.deferred).toEqual([]);
  });

  it("routes van-only outlets to vans", () => {
    const res = allocateOrders(
      [order({ id: "v", isVanOnly: true })],
      [vehicle({ id: "truck" }), vehicle({ id: "van", vehicleType: "HiAce Van" })],
    );
    expect(res.plans.find((p) => p.vehicle.id === "van")?.orders.map((o) => o.id)).toEqual(["v"]);
  });

  it("never exceeds weight or volume and defers the overflow", () => {
    const orders = Array.from({ length: 5 }, (_, i) => order({ id: `o${i}`, totalWeightKg: 200, totalVolumeM3: 3 }));
    const res = allocateOrders(orders, [vehicle()]);
    const plan = res.plans[0];
    expect(plan.weightKg).toBeLessThanOrEqual(1000);
    expect(plan.volumeM3).toBeLessThanOrEqual(10);
    expect(res.assignedCount).toBe(3);
    expect(res.deferred).toHaveLength(2);
    expect(res.deferred[0].reason).toBe("Fleet Capacity");
    expect(res.assignedCount + res.deferred.length).toBe(orders.length);
  });

  it("flags weight-bound overflow as a weight limit", () => {
    const res = allocateOrders([order({ id: "a", totalWeightKg: 800 }), order({ id: "b", totalWeightKg: 800 })], [vehicle()]);
    expect(res.deferred.map((d) => d.reason)).toEqual(["Weight Limit"]);
  });

  it("defers chilled orders with a reefer shortage reason when no reefer exists", () => {
    const res = allocateOrders([order({ tempRequirement: "chilled" })], [vehicle()]);
    expect(res.deferred[0].reason).toBe("Reefer Shortage");
  });

  it("defers everything when there are no vehicles", () => {
    const res = allocateOrders([order()], []);
    expect(res.deferred).toEqual([{ order: expect.objectContaining({ id: "o1" }), reason: "Vehicle Unavailable" }]);
  });

  it("sequences stops on a vehicle by window start", () => {
    const res = allocateOrders(
      [order({ id: "late", windowStart: "10:00", windowEnd: "11:00" }), order({ id: "early", windowStart: "07:00", windowEnd: "09:00" })],
      [vehicle()],
    );
    expect(res.plans[0].orders.map((o) => o.id)).toEqual(["early", "late"]);
  });
});

describe("percentOf / planUtilisation", () => {
  it("caps and guards division by zero", () => {
    expect(percentOf(5, 10)).toBe(50);
    expect(percentOf(20, 10)).toBe(100);
    expect(percentOf(1, 0)).toBe(0);
  });
  it("includes committed load", () => {
    const plan = { vehicle: vehicle({ committedWeightKg: 500, committedVolumeM3: 2 }), orders: [], weightKg: 250, volumeM3: 3 };
    expect(planUtilisation(plan)).toEqual({ weightPercent: 75, volumePercent: 50 });
  });
});
