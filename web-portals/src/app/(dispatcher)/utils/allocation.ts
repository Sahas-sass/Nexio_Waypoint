// Pure allocation logic for the dispatcher planning screen.
// Hard constraints: weight AND volume capacity, chilled goods only on
// refrigerated vehicles, van-only outlets only on vans, store delivery windows.
import type { DispatcherOrder, PlanningVehicle } from "../services/types";
import { haversineKm } from "./geo";
import { DEPOT, PLANNING } from "./constants";

export type DeferralReason =
  | "Fleet Capacity"
  | "Weight Limit"
  | "Vehicle Unavailable"
  | "Window Conflict"
  | "Reefer Shortage";

export type RejectReason = "temperature" | "van_only" | "weight" | "volume" | "window";

export interface VehiclePlan {
  vehicle: PlanningVehicle;
  orders: DispatcherOrder[];
  weightKg: number;
  volumeM3: number;
}

export interface DeferredOrder {
  order: DispatcherOrder;
  reason: DeferralReason;
}

export interface AllocationResult {
  plans: VehiclePlan[];
  deferred: DeferredOrder[];
  assignedCount: number;
}

const PRIORITY_RANK: Record<string, number> = { High: 0, Standard: 1, Low: 2 };

/** "07:30", "07:30:00" → minutes after midnight; null for missing/invalid input. */
export function timeToMinutes(value: string | null | undefined): number | null {
  if (!value) return null;
  const m = /^(\d{1,2}):(\d{2})(?::\d{2})?\s*(AM|PM)?$/i.exec(value.trim());
  if (!m) return null;
  let h = Number(m[1]);
  const min = Number(m[2]);
  const ampm = m[3]?.toUpperCase();
  if (ampm === "PM" && h < 12) h += 12;
  if (ampm === "AM" && h === 12) h = 0;
  if (h > 23 || min > 59) return null;
  return h * 60 + min;
}

export function isVan(vehicle: Pick<PlanningVehicle, "vehicleType" | "plateNumber">): boolean {
  return /\bvan\b/i.test(vehicle.vehicleType) || /^VAN-/i.test(vehicle.plateNumber);
}

/** Static (load independent) compatibility between an order and a vehicle. */
export function staticReject(order: DispatcherOrder, vehicle: PlanningVehicle): RejectReason | null {
  if (order.tempRequirement === "chilled" && !vehicle.isRefrigerated) return "temperature";
  if (order.isVanOnly && !isVan(vehicle)) return "van_only";
  return null;
}

/** Travel minutes between two points; unknown coordinates fall back to the default leg time. */
export function travelMinutes(
  from: { lat: number | null; lng: number | null },
  to: { lat: number | null; lng: number | null },
): number {
  if (from.lat == null || from.lng == null || to.lat == null || to.lng == null) {
    return PLANNING.defaultLegMinutes;
  }
  const km = haversineKm(from.lat, from.lng, to.lat, to.lng);
  return Math.ceil((km / PLANNING.averageSpeedKmh) * 60);
}

/**
 * Checks that every stop on the route can be reached inside its delivery
 * window. Stops are visited in order of window start (earliest first).
 */
export function isScheduleFeasible(orders: DispatcherOrder[], departureMinutes: number): boolean {
  const sorted = sortByWindow(orders);
  let clock = departureMinutes;
  let pos: { lat: number | null; lng: number | null } = { lat: DEPOT.lat, lng: DEPOT.lng };
  for (const o of sorted) {
    const stop = { lat: o.storeLat, lng: o.storeLng };
    clock += travelMinutes(pos, stop);
    const start = timeToMinutes(o.windowStart);
    const end = timeToMinutes(o.windowEnd);
    if (start != null && clock < start) clock = start;
    if (end != null && clock > end) return false;
    clock += PLANNING.serviceMinutes;
    pos = stop;
  }
  return true;
}

export function sortByWindow(orders: DispatcherOrder[]): DispatcherOrder[] {
  return [...orders].sort(
    (a, b) => (timeToMinutes(a.windowStart) ?? 24 * 60) - (timeToMinutes(b.windowStart) ?? 24 * 60),
  );
}

/** Why the order cannot be added to this plan right now, or null if it fits. */
export function rejectReason(order: DispatcherOrder, plan: VehiclePlan): RejectReason | null {
  const v = plan.vehicle;
  const fixed = staticReject(order, v);
  if (fixed) return fixed;
  if (v.committedWeightKg + plan.weightKg + order.totalWeightKg > v.maxWeightKg) return "weight";
  if (v.committedVolumeM3 + plan.volumeM3 + order.totalVolumeM3 > v.maxVolumeM3) return "volume";
  const departure = timeToMinutes(v.departureTime) ?? PLANNING.defaultDepartureMinutes;
  if (!isScheduleFeasible([...plan.orders, order], departure)) return "window";
  return null;
}

/** Order in which orders are considered: priority, chilled first, tightest window, bigger first. */
export function sortOrdersForAllocation(orders: DispatcherOrder[]): DispatcherOrder[] {
  return [...orders].sort((a, b) => {
    const p = (PRIORITY_RANK[a.priority] ?? 1) - (PRIORITY_RANK[b.priority] ?? 1);
    if (p) return p;
    const t = Number(b.tempRequirement === "chilled") - Number(a.tempRequirement === "chilled");
    if (t) return t;
    const w = (timeToMinutes(a.windowEnd) ?? 24 * 60) - (timeToMinutes(b.windowEnd) ?? 24 * 60);
    if (w) return w;
    return b.totalVolumeM3 - a.totalVolumeM3;
  });
}

/** Maps the per-vehicle rejection reasons for an order to one deferral reason. */
export function deferralReasonFor(reasons: RejectReason[]): DeferralReason {
  if (reasons.length === 0) return "Vehicle Unavailable";
  const capacityOrWindow = reasons.filter((r) => r !== "temperature" && r !== "van_only");
  if (capacityOrWindow.length === 0) {
    return reasons.includes("temperature") ? "Reefer Shortage" : "Vehicle Unavailable";
  }
  if (capacityOrWindow.includes("window") && !capacityOrWindow.some((r) => r === "volume" || r === "weight")) {
    return "Window Conflict";
  }
  if (capacityOrWindow.includes("weight") && !capacityOrWindow.includes("volume")) return "Weight Limit";
  return "Fleet Capacity";
}

function remainingVolume(plan: VehiclePlan): number {
  return plan.vehicle.maxVolumeM3 - plan.vehicle.committedVolumeM3 - plan.volumeM3;
}

/**
 * Greedy constraint-respecting allocation. Every order is either placed on a
 * vehicle that satisfies all constraints or returned in `deferred` with a reason.
 */
export function allocateOrders(orders: DispatcherOrder[], vehicles: PlanningVehicle[]): AllocationResult {
  const plans: VehiclePlan[] = vehicles.map((vehicle) => ({ vehicle, orders: [], weightKg: 0, volumeM3: 0 }));
  const deferred: DeferredOrder[] = [];
  let assignedCount = 0;

  for (const order of sortOrdersForAllocation(orders)) {
    const reasons: RejectReason[] = [];
    const candidates: VehiclePlan[] = [];
    for (const plan of plans) {
      const r = rejectReason(order, plan);
      if (r) reasons.push(r);
      else candidates.push(plan);
    }
    if (candidates.length === 0) {
      deferred.push({ order, reason: deferralReasonFor(reasons) });
      continue;
    }
    // Keep reefers for chilled goods, reuse vehicles already on the road, tightest fit.
    candidates.sort((a, b) => {
      if (order.tempRequirement !== "chilled") {
        const reefer = Number(a.vehicle.isRefrigerated) - Number(b.vehicle.isRefrigerated);
        if (reefer) return reefer;
      }
      const used = Number(b.orders.length > 0) - Number(a.orders.length > 0);
      if (used) return used;
      return remainingVolume(a) - remainingVolume(b);
    });
    const chosen = candidates[0];
    chosen.orders.push(order);
    chosen.weightKg += order.totalWeightKg;
    chosen.volumeM3 += order.totalVolumeM3;
    assignedCount += 1;
  }

  for (const plan of plans) plan.orders = sortByWindow(plan.orders);
  return { plans, deferred, assignedCount };
}

/** Utilisation (0-100, capped) of a plan including load already committed. */
export function planUtilisation(plan: VehiclePlan): { weightPercent: number; volumePercent: number } {
  const v = plan.vehicle;
  return {
    weightPercent: percentOf(v.committedWeightKg + plan.weightKg, v.maxWeightKg),
    volumePercent: percentOf(v.committedVolumeM3 + plan.volumeM3, v.maxVolumeM3),
  };
}

export function percentOf(value: number, max: number): number {
  if (!max || max <= 0) return 0;
  return Math.min(100, Math.max(0, Math.round((value / max) * 100)));
}
