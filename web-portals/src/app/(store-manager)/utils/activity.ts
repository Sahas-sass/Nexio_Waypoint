import type { DeferralLog, Order, StoreReceipt } from "../types";

export type ActivityKind = "submitted" | "deferred" | "received" | "issue";

export interface ActivityItem {
  id: string;
  kind: ActivityKind;
  title: string;
  subtitle: string;
  status: string;
  at: string;
}

/** Builds a newest-first activity feed from the store's real orders, receipts and deferrals. */
export function deferredTitle(orderNumber: string | null | undefined): string {
  return orderNumber ? `Order ${orderNumber} deferred` : "Order deferred";
}

export function buildActivity(
  orders: Order[],
  receipts: StoreReceipt[],
  deferrals: DeferralLog[],
  limit = 6,
): ActivityItem[] {
  const byId = new Map(orders.map((o) => [o.id, o]));
  const items: ActivityItem[] = [];

  for (const o of orders) {
    items.push({
      id: `order-${o.id}`, kind: "submitted", title: `Order ${o.order_number} submitted`,
      subtitle: `${o.item_count ?? "?"} items · ${o.temp_requirement ?? "ambient"}`, status: o.status, at: o.created_at,
    });
    if (o.status === "deferred" && o.deferred_at && !deferrals.some((d) => d.order_id === o.id)) {
      items.push({
        id: `deferred-${o.id}`, kind: "deferred", title: `Order ${o.order_number} deferred`,
        subtitle: o.rescheduled_run ? `Moved to ${o.rescheduled_run}` : o.deferral_reason ?? "Awaiting new run", status: "Review", at: o.deferred_at,
      });
    }
  }
  for (const d of deferrals) {
    items.push({
      id: `deferral-${d.id}`, kind: "deferred", title: deferredTitle(d.order_number ?? byId.get(d.order_id ?? "")?.order_number),
      subtitle: d.rescheduled_run ? `Moved to ${d.rescheduled_run}` : d.reason ?? "Awaiting new run", status: "Review", at: d.deferred_at,
    });
  }
  for (const r of receipts) {
    const number = byId.get(r.order_id)?.order_number ?? "order";
    items.push({
      id: `receipt-${r.id}`, kind: r.status === "received" ? "received" : "issue",
      title: `Order ${number} ${r.status === "received" ? "received" : `received (${r.status})`}`,
      subtitle: `${r.items_received ?? 0} of ${r.items_expected ?? "?"} items checked`,
      status: r.status === "received" ? "Complete" : "Issue reported", at: r.received_at,
    });
  }
  return items.sort((a, b) => b.at.localeCompare(a.at)).slice(0, limit);
}
