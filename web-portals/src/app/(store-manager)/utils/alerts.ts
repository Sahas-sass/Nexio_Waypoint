import { deferredTitle } from "./activity";
import type { DeferralLog, Order, StoreException } from "../types";

export type AlertKind = "deferral" | "exception";

export interface StoreAlert {
  id: string;
  kind: AlertKind;
  title: string;
  reason: string;
  detail: string | null;
  at: string;
  unread: boolean;
}

/** Combines deferral logs, deferred orders without a log and exception rows into one feed. */
export function buildAlerts(deferrals: DeferralLog[], orders: Order[], exceptions: StoreException[]): StoreAlert[] {
  const numbers = new Map(orders.map((o) => [o.id, o.order_number]));
  const logged = new Set(deferrals.map((d) => d.order_id));
  const alerts: StoreAlert[] = [];

  for (const d of deferrals) {
    alerts.push({
      id: `deferral-${d.id}`, kind: "deferral",
      title: deferredTitle(d.order_number ?? numbers.get(d.order_id ?? "")),
      reason: d.reason ?? "No reason given",
      detail: [d.rescheduled_run && `Rescheduled to ${d.rescheduled_run}`, d.notes].filter(Boolean).join(" · ") || null,
      at: d.deferred_at, unread: false,
    });
  }
  for (const o of orders) {
    if (o.status !== "deferred" || logged.has(o.id)) continue;
    alerts.push({
      id: `order-${o.id}`, kind: "deferral", title: `Order ${o.order_number} deferred`,
      reason: o.deferral_reason ?? "No reason given",
      detail: o.rescheduled_run ? `Rescheduled to ${o.rescheduled_run}` : null,
      at: o.deferred_at ?? o.created_at, unread: false,
    });
  }
  for (const e of exceptions) {
    const number = e.order_id ? numbers.get(e.order_id) : undefined;
    alerts.push({
      id: `exception-${e.id}`, kind: "exception", title: number ? `Exception on ${number}` : "Delivery exception",
      reason: (e.reason_code ?? "UNKNOWN").replace(/_/g, " "), detail: e.action_taken, at: e.created_at, unread: e.is_read === false,
    });
  }
  return alerts.sort((a, b) => b.at.localeCompare(a.at));
}
