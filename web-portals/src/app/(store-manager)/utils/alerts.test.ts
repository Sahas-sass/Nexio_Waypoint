import { describe, expect, it } from "vitest";
import type { DeferralLog, Order, StoreException } from "../types";
import { buildAlerts } from "./alerts";

const order = (id: string, extra: Partial<Order> = {}): Order => ({
  id, order_number: `ORD-${id}`, status: "deferred", target_delivery_date: null, temp_requirement: "ambient", total_weight_kg: 1,
  total_volume_m3: 1, item_count: 1, priority: "Standard", delivery_window: null, deferral_reason: "Fleet Capacity", deferred_at: null,
  rescheduled_run: "Tomorrow - 10:00 AM", notes: null, created_at: "2026-10-01T00:00:00Z", ...extra,
});

describe("buildAlerts", () => {
  it("combines all sources, sorted newest first, without duplicating logged deferrals", () => {
    const logs: DeferralLog[] = [{ id: "l1", order_id: "1", order_number: null, reason: "Capacity", rescheduled_run: "Mon", deferred_at: "2026-10-02T00:00:00Z", notes: "call us" }];
    const exc: StoreException[] = [
      { id: "e1", order_id: "2", reason_code: "WRONG_ITEM", action_taken: "Store reported", is_read: false, created_at: "2026-10-03T00:00:00Z" },
      { id: "e2", order_id: null, reason_code: null, action_taken: null, is_read: true, created_at: "2026-09-30T00:00:00Z" },
    ];
    const alerts = buildAlerts(logs, [order("1"), order("2"), order("3", { status: "pending" })], exc);
    expect(alerts.map((a) => a.id)).toEqual(["exception-e1", "deferral-l1", "order-2", "exception-e2"]);
    expect(alerts[0]).toMatchObject({ title: "Exception on ORD-2", reason: "WRONG ITEM", unread: true });
    expect(alerts[1]).toMatchObject({ title: "Order ORD-1 deferred", reason: "Capacity", detail: "Rescheduled to Mon · call us" });
    expect(alerts[2]).toMatchObject({ reason: "Fleet Capacity", detail: "Rescheduled to Tomorrow - 10:00 AM", at: "2026-10-01T00:00:00Z" });
    expect(alerts[3]).toMatchObject({ title: "Delivery exception", reason: "UNKNOWN", unread: false });
  });

  it("handles missing reasons and details", () => {
    const logs: DeferralLog[] = [{ id: "l", order_id: null, order_number: "ORD-9", reason: null, rescheduled_run: null, deferred_at: "2026-10-02T00:00:00Z", notes: null }];
    const [a] = buildAlerts(logs, [], []);
    expect(a).toMatchObject({ title: "Order ORD-9 deferred", reason: "No reason given", detail: null });
    const [b] = buildAlerts([], [order("4", { deferral_reason: null, rescheduled_run: null })], []);
    expect(b).toMatchObject({ reason: "No reason given", detail: null });
  });
});
