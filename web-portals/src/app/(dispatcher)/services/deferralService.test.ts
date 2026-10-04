import { beforeEach, describe, expect, it, vi } from "vitest";
import { createSupabaseMock } from "./testSupabaseMock";

const mock = vi.hoisted(() => ({ current: null as unknown as ReturnType<typeof createSupabaseMock> }));
vi.mock("@/lib/supabaseClient", async () => {
  const { createSupabaseMock } = await import("./testSupabaseMock");
  mock.current = createSupabaseMock();
  return { supabase: mock.current.client };
});

import { submitDeferrals } from "./deferralService";
import type { DispatcherOrder } from "./types";

const order = { id: "o1", orderNumber: "ORD-1", storeId: "s1", storeName: "Fresh Store #18", priority: "High", totalVolumeM3: 2, totalWeightKg: 300, deliveryWindow: "07:00 - 08:00" } as DispatcherOrder;

describe("submitDeferrals", () => {
  beforeEach(() => mock.current.reset());

  it("does nothing for an empty selection", async () => {
    expect(await submitDeferrals({ orders: [], reason: "x", rescheduledRun: "y" })).toEqual({ count: 0 });
    expect(mock.current.calls).toHaveLength(0);
  });

  it("validates reason and run", async () => {
    await expect(submitDeferrals({ orders: [order], reason: " ", rescheduledRun: "y" })).rejects.toThrow(/required/);
  });

  it("updates orders and writes a log row with real order data", async () => {
    const res = await submitDeferrals({ orders: [order], reason: "Fleet Capacity", rescheduledRun: "Tue - Morning run", deferredBy: "u1" });
    expect(res).toEqual({ count: 1 });
    const upd = mock.current.opsOf("orders");
    expect(upd[0].method).toBe("update");
    expect(upd[0].args[0]).toMatchObject({ status: "deferred", deferral_reason: "Fleet Capacity", rescheduled_run: "Tue - Morning run" });
    expect(upd[1]).toEqual({ method: "in", args: ["id", ["o1"]] });
    const ins = mock.current.opsOf("deferral_logs")[0];
    expect((ins.args[0] as object[])[0]).toMatchObject({
      order_id: "o1",
      order_number: "ORD-1",
      store_id: "s1",
      store_name: "Fresh Store #18",
      volume_m3: 2,
      weight_kg: 300,
      deferred_by: "u1",
    });
  });

  it("surfaces database errors", async () => {
    mock.current.queue("orders", { error: { message: "denied" } });
    await expect(submitDeferrals({ orders: [order], reason: "a", rescheduledRun: "b" })).rejects.toThrow("denied");
    mock.current.queue("deferral_logs", { error: { message: "log failed" } });
    await expect(submitDeferrals({ orders: [order], reason: "a", rescheduledRun: "b" })).rejects.toThrow("log failed");
  });
});
