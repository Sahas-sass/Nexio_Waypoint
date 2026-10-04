// Pure aggregation of command-center KPIs from Supabase rows.
import type { CommandCenterData, DispatcherOrder, FleetCapacityItem, OperationalAlert } from "../services/types";
import { NEAR_CAPACITY_PERCENT } from "./constants";
import { formatDateLabel, one } from "./format";
import { committedLoad, toNumber, type VehicleRow, type VehicleTripRow } from "./mappers";
import { percentOf, sortByWindow } from "./allocation";
import { getVehicleImage } from "./vehicleImage";

export interface CommandTripRow extends VehicleTripRow {
  id: string;
  status: string | null;
  eta_time: string | null;
  delay_minutes: number | null;
  vehicles: VehicleRow | VehicleRow[] | null;
}

export interface CommandCenterInput {
  planningDate: string;
  plannedOrders: (DispatcherOrder & { status: string })[];
  deferredCount: number;
  activeVehicleCount: number;
  todaysTrips: CommandTripRow[];
}

export function buildFleetBreakdown(trips: CommandTripRow[]): FleetCapacityItem[] {
  return trips.flatMap((t) => {
    const v = one(t.vehicles);
    if (!v) return [];
    const load = committedLoad([t]);
    return [{
      id: t.id,
      plate: v.registration_number,
      model: v.vehicle_type ?? "",
      weightPercent: percentOf(load.weightKg, toNumber(v.max_weight_kg)),
      volumePercent: percentOf(load.volumeM3, toNumber(v.max_volume_m3)),
      isRefrigerated: Boolean(v.is_refrigerated),
      image: getVehicleImage({ vehicleType: v.vehicle_type, isRefrigerated: v.is_refrigerated }),
    }];
  });
}

/** Earliest "7:42 AM"-style ETA string among the given values. */
export function earliestEta(etas: (string | null)[]): string | null {
  const parsed = etas
    .filter((e): e is string => Boolean(e))
    .map((e) => {
      const m = /^(\d{1,2}):(\d{2})\s*(AM|PM)?$/i.exec(e.trim());
      if (!m) return null;
      let h = Number(m[1]);
      if (m[3]?.toUpperCase() === "PM" && h < 12) h += 12;
      if (m[3]?.toUpperCase() === "AM" && h === 12) h = 0;
      return { label: e.trim(), minutes: h * 60 + Number(m[2]) };
    })
    .filter((x): x is { label: string; minutes: number } => x !== null)
    .sort((a, b) => a.minutes - b.minutes);
  return parsed[0]?.label ?? null;
}

export function buildAlerts(
  fleet: FleetCapacityItem[],
  pending: DispatcherOrder[],
  planningDate: string,
): OperationalAlert[] {
  const alerts: OperationalAlert[] = [];
  for (const v of fleet) {
    const peak = Math.max(v.weightPercent, v.volumePercent);
    if (peak >= NEAR_CAPACITY_PERCENT) {
      alerts.push({
        id: `cap-${v.id}`,
        type: "capacity",
        title: "Vehicle approaching capacity",
        description: `${v.plate} is at ${peak}% of its ${v.weightPercent >= v.volumePercent ? "weight" : "volume"} limit`,
        level: peak >= 100 ? "critical" : "warning",
      });
    }
  }
  const firstWindow = sortByWindow(pending).find((o) => o.windowStart);
  if (firstWindow) {
    alerts.push({
      id: `win-${firstWindow.id}`,
      type: "time",
      title: `Earliest window ${firstWindow.windowStart}`,
      description: `${firstWindow.storeName} (${firstWindow.orderNumber}) must be planned first`,
      level: "info",
    });
  }
  if (pending.length > 0) {
    alerts.push({
      id: "review-pending",
      type: "review",
      title: "Allocation review required",
      description: `${pending.length} order${pending.length === 1 ? "" : "s"} for ${formatDateLabel(planningDate)} not yet allocated`,
      level: "warning",
    });
  }
  return alerts;
}

export function buildCommandCenterData(input: CommandCenterInput): CommandCenterData {
  const { plannedOrders, todaysTrips } = input;
  const pending = plannedOrders.filter((o) => o.status === "pending");
  const fleet = buildFleetBreakdown(todaysTrips);

  let capVolUsed = 0;
  let capVolMax = 0;
  for (const t of todaysTrips) {
    const v = one(t.vehicles);
    if (!v) continue;
    const load = committedLoad([t]);
    capVolUsed += load.volumeM3;
    capVolMax += toNumber(v.max_volume_m3);
  }

  const onRoad = todaysTrips.filter((t) => t.status === "en_route");
  const timed = todaysTrips.filter((t) => t.status === "en_route" || t.status === "completed");
  const busyVehicles = new Set(
    todaysTrips.filter((t) => t.status === "en_route" || t.status === "loading").map((t) => one(t.vehicles)?.id),
  );

  return {
    totalOrders: plannedOrders.length,
    pendingOrders: pending.length,
    fleetCapacityPercent: capVolMax > 0 ? percentOf(capVolUsed, capVolMax) : null,
    vehiclesReadyCount: Math.max(0, input.activeVehicleCount - busyVehicles.size),
    totalVehiclesCount: input.activeVehicleCount,
    pendingDeferralsCount: input.deferredCount,
    firstEta: earliestEta(onRoad.map((t) => t.eta_time)),
    activeRoutesCount: onRoad.length,
    onTimeRatePercent: timed.length > 0 ? percentOf(timed.filter((t) => !toNumber(t.delay_minutes)).length, timed.length) : null,
    orderQueue: plannedOrders.map((o) => ({
      id: o.id,
      storeName: o.storeName,
      storeInitial: o.storeInitial,
      orderNumber: o.orderNumber,
      timeWindow: o.deliveryWindow,
      volumeM3: o.totalVolumeM3,
      priority: o.priority,
      status: o.status.charAt(0).toUpperCase() + o.status.slice(1),
      tempRequirement: o.tempRequirement,
    })),
    fleetCapacityBreakdown: fleet,
    operationalAlerts: buildAlerts(fleet, pending, input.planningDate),
  };
}
