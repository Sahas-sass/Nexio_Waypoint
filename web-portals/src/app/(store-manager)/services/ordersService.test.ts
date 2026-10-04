import { beforeEach, describe, expect, it, vi } from "vitest";
import { queryMock } from "./queryMock.testutil";

const { mockSupabase } = vi.hoisted(() => ({ mockSupabase: { from: vi.fn(), rpc: vi.fn() } }));
vi.mock("@/lib/supabaseClient", () => ({ supabase: mockSupabase }));

import { fetchStoreOrders, placeOrder } from "./ordersService";

describe("ordersService", () => {
  beforeEach(() => vi.resetAllMocks());

  it("fetches the store's orders newest first", async () => {
    const q = queryMock({ data: [{ id: "o1" }], error: null });
    mockSupabase.from.mockReturnValue(q.builder);
    await expect(fetchStoreOrders("s1")).resolves.toEqual([{ id: "o1" }]);
    expect(mockSupabase.from).toHaveBeenCalledWith("orders");
    expect(q.calls).toContainEqual(["eq", ["store_id", "s1"]]);
    expect(q.calls).toContainEqual(["order", ["created_at", { ascending: false }]]);
  });

  it("throws fetch errors", async () => {
    mockSupabase.from.mockReturnValue(queryMock({ data: null, error: { message: "denied" } }).builder);
    await expect(fetchStoreOrders("s1")).rejects.toThrow("denied");
  });

  it("calls place_order with mapped args", async () => {
    mockSupabase.rpc.mockResolvedValue({ data: { id: "new" }, error: null });
    const order = await placeOrder({ targetDate: "2026-10-06", temp: "chilled", weightKg: 5, volumeM3: 1, itemCount: 3, priority: "High", notes: null });
    expect(order).toEqual({ id: "new" });
    expect(mockSupabase.rpc).toHaveBeenCalledWith("place_order", {
      p_target_date: "2026-10-06", p_temp: "chilled", p_weight_kg: 5, p_volume_m3: 1, p_item_count: 3, p_priority: "High", p_notes: null,
    });
  });

  it("surfaces server validation errors", async () => {
    mockSupabase.rpc.mockResolvedValue({ data: null, error: { message: "Order cutoff passed: earliest delivery date is 2026-10-06" } });
    await expect(
      placeOrder({ targetDate: "2026-10-04", temp: "ambient", weightKg: 1, volumeM3: 1, itemCount: 1, priority: "Standard", notes: null }),
    ).rejects.toThrow("Order cutoff passed");
  });
});
