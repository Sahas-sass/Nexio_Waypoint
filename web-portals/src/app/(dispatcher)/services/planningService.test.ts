import { beforeEach, describe, expect, it, vi } from "vitest";
import { createSupabaseMock } from "./testSupabaseMock";

const mock = vi.hoisted(() => ({ current: null as unknown as ReturnType<typeof createSupabaseMock> }));
vi.mock("@/lib/supabaseClient", async () => {
  const { createSupabaseMock } = await import("./testSupabaseMock");
  mock.current = createSupabaseMock();
  return { supabase: mock.current.client };
});

import { fetchPendingOrders, fetchPlanningVehicles, publishAllocation } from "./planningService";
import type { AllocationResult } from "../utils/allocation";
import type { DispatcherOrder, PlanningVehicle } from "./types";

const orderRow = {
  id: "o1", order_number: "ORD-1", store_id: "s1", total_weight_kg: 100, total_volume_m3: 1,
  temp_requirement: "ambient", priority: "High", delivery_window: null, target_delivery_date: "2026-10-05", item_count: 5,
  stores: { name: "Fresh Store #22", is_van_only: true, delivery_window_start: "08:00:00", delivery_window_end: "08:30:00" },
};

describe("fetchPendingOrders", () => {
  beforeEach(() => mock.current.reset());
  it("queries pending orders for the date and maps them", async () => {
    mock.current.queue("orders", { data: [orderRow] });
    const res = await fetchPendingOrders("2026-10-05");
    expect(res[0]).toMatchObject({ id: "o1", isVanOnly: true, windowStart: "08:00" });
    const ops = mock.current.opsOf("orders");
    expect(ops).toContainEqual({ method: "eq", args: ["status", "pending"] });
    expect(ops).toContainEqual({ method: "eq", args: ["target_delivery_date", "2026-10-05"] });
  });
  it("throws on error", async () => {
    mock.current.queue("orders", { error: { message: "boom" } });
    await expect(fetchPendingOrders("2026-10-05")).rejects.toThrow("boom");
  });
});

describe("fetchPlanningVehicles", () => {
  beforeEach(() => mock.current.reset());
  it("attaches the trip load of each vehicle for the date", async () => {
    mock.current.queue("vehicles", {
      data: [
        { id: "v1", registration_number: "TRK-1", vehicle_type: "Truck", max_weight_kg: 1000, max_volume_m3: 10, is_refrigerated: true },
        { id: "v2", registration_number: "VAN-1", vehicle_type: "Van", max_weight_kg: 500, max_volume_m3: 5, is_refrigerated: false },
      ],
    });
    mock.current.queue("trips", {
      data: [{ vehicle_id: "v1", trip_number: "TRIP 1", departure_time: "06:30 AM", driver: null, trip_stops: [{ orders: { total_weight_kg: 200, total_volume_m3: 2 } }] }],
    });
    const res = await fetchPlanningVehicles("2026-10-05");
    expect(res.map((v) => [v.plateNumber, v.committedWeightKg, v.departureTime])).toEqual([["TRK-1", 200, "06:30"], ["VAN-1", 0, null]]);
    expect(mock.current.opsOf("vehicles")).toContainEqual({ method: "eq", args: ["is_active", true] });
  });
  it("throws when trips cannot be read", async () => {
    mock.current.queue("trips", { error: { message: "rls" } });
    await expect(fetchPlanningVehicles("2026-10-05")).rejects.toThrow("rls");
  });
});

describe("publishAllocation", () => {
  beforeEach(() => mock.current.reset());
  const vehicle = { id: "v1", plateNumber: "TRK-1" } as PlanningVehicle;
  const o = (id: string) => ({ id, storeId: `s-${id}`, orderNumber: id, storeName: id, priority: "High", totalVolumeM3: 1, totalWeightKg: 1, deliveryWindow: "" }) as DispatcherOrder;
  const result: AllocationResult = {
    plans: [{ vehicle, orders: [o("a"), o("b")], weightKg: 2, volumeM3: 2 }, { vehicle: { ...vehicle, id: "v2" }, orders: [], weightKg: 0, volumeM3: 0 }],
    deferred: [{ order: o("c"), reason: "Fleet Capacity" }],
    assignedCount: 2,
  };

  it("defers leftovers and publishes each used vehicle through the RPC", async () => {
    const res = await publishAllocation("2026-10-05", result, "u1");
    expect(res).toEqual({ tripsCount: 1, assignedCount: 2, deferredCount: 1 });
    expect(mock.current.opsOf("deferral_logs")).toHaveLength(1);
    expect(mock.current.calls.filter((c) => c.table === "rpc:publish_vehicle_plan")).toHaveLength(1);
    expect(mock.current.opsOf("rpc:publish_vehicle_plan")[0].args[0]).toEqual({
      p_vehicle_id: "v1",
      p_trip_date: "2026-10-05",
      p_order_ids: ["a", "b"],
    });
  });

  it("surfaces the server-side constraint error with the vehicle plate", async () => {
    mock.current.queue("rpc:publish_vehicle_plan", { error: { message: "Vehicle TRK-1 is not refrigerated" } });
    await expect(publishAllocation("2026-10-05", { ...result, deferred: [] })).rejects.toThrow(
      /TRK-1: Vehicle TRK-1 is not refrigerated/,
    );
  });
});
