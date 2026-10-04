import { beforeEach, describe, expect, it, vi } from "vitest";
import { createSupabaseMock } from "./testSupabaseMock";

const mock = vi.hoisted(() => ({ current: null as unknown as ReturnType<typeof createSupabaseMock> }));
vi.mock("@/lib/supabaseClient", async () => {
  const { createSupabaseMock } = await import("./testSupabaseMock");
  mock.current = createSupabaseMock();
  return { supabase: mock.current.client };
});

import { fetchCommandCenterMetrics } from "./commandCenterService";

describe("fetchCommandCenterMetrics", () => {
  beforeEach(() => mock.current.reset());
  it("combines orders, deferred count, vehicles and today's trips", async () => {
    mock.current.queue(
      "orders",
      { data: [{ status: "pending", id: "o1", order_number: "ORD-1", store_id: "s1", total_weight_kg: 1, total_volume_m3: 1, temp_requirement: "ambient", priority: "High", delivery_window: "Before 8", target_delivery_date: "2026-10-05", stores: { name: "Fresh" } }] },
      { count: 3 },
    );
    mock.current.queue("vehicles", { count: 8 });
    mock.current.queue("trips", { data: [] });
    const res = await fetchCommandCenterMetrics("2026-10-04", "2026-10-05");
    expect(res).toMatchObject({ totalOrders: 1, pendingOrders: 1, pendingDeferralsCount: 3, totalVehiclesCount: 8, vehiclesReadyCount: 8, fleetCapacityPercent: null });
    expect(mock.current.opsOf("trips")).toContainEqual({ method: "eq", args: ["trip_date", "2026-10-04"] });
    expect(mock.current.opsOf("orders")).toContainEqual({ method: "eq", args: ["target_delivery_date", "2026-10-05"] });
  });
  it("throws when any query fails", async () => {
    mock.current.queue("vehicles", { error: { message: "denied" } });
    await expect(fetchCommandCenterMetrics("2026-10-04", "2026-10-05")).rejects.toThrow("denied");
  });
});
