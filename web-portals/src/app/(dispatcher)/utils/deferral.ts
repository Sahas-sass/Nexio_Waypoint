import type { DeferredOrder } from "./allocation";
import { formatDateLabel, isoDate } from "./format";

/** Rescheduling choices: the next three delivery days after the planning date. */
export function nextRunOptions(planningDate: string, count = 3): string[] {
  const [y, m, d] = planningDate.split("-").map(Number);
  if (!y || !m || !d) return [];
  const base = new Date(y, m - 1, d);
  return Array.from({ length: count }, (_, i) => `${formatDateLabel(isoDate(base, i + 1))} - Morning run`);
}

export function deferralSummary(items: DeferredOrder[]): { orders: number; stores: number; volumeM3: number; weightKg: number } {
  return {
    orders: items.length,
    stores: new Set(items.map((d) => d.order.storeId)).size,
    volumeM3: items.reduce((s, d) => s + d.order.totalVolumeM3, 0),
    weightKg: items.reduce((s, d) => s + d.order.totalWeightKg, 0),
  };
}
