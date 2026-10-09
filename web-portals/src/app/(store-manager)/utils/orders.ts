import type { Order, OrderStatus, StoreReceipt, TempType } from "../types";

export interface OrderFilters {
  status: OrderStatus | "all";
  temp: TempType | "all";
  search: string;
}

export const ORDER_STATUSES: OrderStatus[] = ["pending", "planning", "assigned", "deferred", "delivered"];
const OPEN_STATUSES: OrderStatus[] = ["pending", "planning", "assigned"];

export function filterOrders(orders: Order[], filters: OrderFilters): Order[] {
  const q = filters.search.trim().toLowerCase();
  return orders.filter(
    (o) =>
      (filters.status === "all" || o.status === filters.status) &&
      (filters.temp === "all" || o.temp_requirement === filters.temp) &&
      (!q || o.order_number.toLowerCase().includes(q) || (o.notes ?? "").toLowerCase().includes(q)),
  );
}

export interface OrderKpis {
  open: number;
  deferred: number;
  awaitingConfirmation: number;
}

/** KPIs from the store's orders; delivered orders without a receipt await confirmation. */
export function computeOrderKpis(orders: Order[], receipts: Pick<StoreReceipt, "order_id">[]): OrderKpis {
  const confirmed = new Set(receipts.map((r) => r.order_id));
  return {
    open: orders.filter((o) => OPEN_STATUSES.includes(o.status)).length,
    deferred: orders.filter((o) => o.status === "deferred").length,
    awaitingConfirmation: orders.filter((o) => o.status === "delivered" && !confirmed.has(o.id)).length,
  };
}

export function awaitingReceipt(orders: Order[], receipts: Pick<StoreReceipt, "order_id">[]): Order[] {
  const confirmed = new Set(receipts.map((r) => r.order_id));
  return orders.filter((o) => o.status === "delivered" && !confirmed.has(o.id));
}

export function formatQuantity(value: number | null | undefined, unit: string): string {
  if (value === null || value === undefined) return "—";
  return `${Number(value).toLocaleString("en-US", { maximumFractionDigits: 2 })} ${unit}`;
}
