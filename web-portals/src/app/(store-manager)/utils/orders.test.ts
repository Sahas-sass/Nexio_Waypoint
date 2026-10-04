import { describe, expect, it } from "vitest";
import type { Order } from "../types";
import { awaitingReceipt, computeOrderKpis, filterOrders, formatQuantity } from "./orders";

const o = (id: string, status: Order["status"], extra: Partial<Order> = {}): Order => ({
  id, order_number: `ORD-${id}`, status, target_delivery_date: null, temp_requirement: "ambient", total_weight_kg: 1,
  total_volume_m3: 1, item_count: 1, priority: "Standard", delivery_window: null, deferral_reason: null, deferred_at: null,
  rescheduled_run: null, notes: null, created_at: "2026-10-01T00:00:00Z", ...extra,
});
const orders = [o("1", "pending"), o("2", "assigned", { temp_requirement: "chilled", notes: "Milk" }), o("3", "deferred"), o("4", "delivered"), o("5", "delivered")];

describe("filterOrders", () => {
  it("filters by status, temp and search", () => {
    expect(filterOrders(orders, { status: "all", temp: "all", search: "" })).toHaveLength(5);
    expect(filterOrders(orders, { status: "delivered", temp: "all", search: "" }).map((x) => x.id)).toEqual(["4", "5"]);
    expect(filterOrders(orders, { status: "all", temp: "chilled", search: "" }).map((x) => x.id)).toEqual(["2"]);
    expect(filterOrders(orders, { status: "all", temp: "all", search: "ord-3" }).map((x) => x.id)).toEqual(["3"]);
    expect(filterOrders(orders, { status: "all", temp: "all", search: "milk" }).map((x) => x.id)).toEqual(["2"]);
  });
});

describe("computeOrderKpis / awaitingReceipt", () => {
  it("counts open, deferred and unconfirmed deliveries", () => {
    expect(computeOrderKpis(orders, [{ order_id: "4" }])).toEqual({ open: 2, deferred: 1, awaitingConfirmation: 1 });
    expect(awaitingReceipt(orders, [{ order_id: "4" }]).map((x) => x.id)).toEqual(["5"]);
  });
});

describe("formatQuantity", () => {
  it("formats numbers with units and handles null", () => {
    expect(formatQuantity(1250.456, "kg")).toBe("1,250.46 kg");
    expect(formatQuantity(null, "kg")).toBe("—");
  });
});
