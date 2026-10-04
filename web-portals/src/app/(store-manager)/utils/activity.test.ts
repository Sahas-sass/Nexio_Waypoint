import { describe, expect, it } from "vitest";
import type { DeferralLog, Order, StoreReceipt } from "../types";
import { buildActivity, deferredTitle } from "./activity";

const order = (id: string, extra: Partial<Order> = {}): Order => ({
  id, order_number: `ORD-${id}`, status: "pending", target_delivery_date: null, temp_requirement: "chilled", total_weight_kg: 1,
  total_volume_m3: 1, item_count: 10, priority: "Standard", delivery_window: null, deferral_reason: null, deferred_at: null,
  rescheduled_run: null, notes: null, created_at: "2026-10-01T00:00:00Z", ...extra,
});

describe("buildActivity", () => {
  it("merges orders, deferrals and receipts newest first", () => {
    const orders = [order("1"), order("2", { status: "deferred", deferred_at: "2026-10-02T00:00:00Z", rescheduled_run: "Tomorrow" })];
    const receipts: StoreReceipt[] = [{
      id: "r1", order_id: "1", status: "partial", items_expected: 10, items_received: 8, issue_type: "shortage", issue_note: null, received_at: "2026-10-03T00:00:00Z",
    }];
    const items = buildActivity(orders, receipts, []);
    expect(items.map((i) => i.id)).toEqual(["receipt-r1", "deferred-2", "order-1", "order-2"]);
    expect(items[0]).toMatchObject({ kind: "issue", title: "Order ORD-1 received (partial)", subtitle: "8 of 10 items checked" });
    expect(items[1].subtitle).toBe("Moved to Tomorrow");
  });

  it("prefers deferral logs over the order's deferral fields and respects the limit", () => {
    const orders = [order("2", { status: "deferred", deferred_at: "2026-10-02T00:00:00Z", deferral_reason: "Fleet" })];
    const logs: DeferralLog[] = [{ id: "d1", order_id: "2", order_number: null, reason: "Fleet", rescheduled_run: null, deferred_at: "2026-10-02T00:00:00Z", notes: null }];
    const items = buildActivity(orders, [], logs);
    expect(items.map((i) => i.id)).toEqual(["deferral-d1", "order-2"]);
    expect(items[0]).toMatchObject({ title: "Order ORD-2 deferred", subtitle: "Fleet" });
    expect(buildActivity(orders, [], logs, 1)).toHaveLength(1);
  });

  it("marks full receipts complete", () => {
    const r: StoreReceipt = { id: "r", order_id: "x", status: "received", items_expected: 2, items_received: 2, issue_type: null, issue_note: null, received_at: "2026-10-03T00:00:00Z" };
    expect(buildActivity([], [r], [])[0]).toMatchObject({ kind: "received", status: "Complete", title: "Order order received" });
  });
});

describe("deferredTitle", () => {
  it("includes the order number when known", () => {
    expect(deferredTitle("ORD-1")).toBe("Order ORD-1 deferred");
    expect(deferredTitle(null)).toBe("Order deferred");
  });
});
