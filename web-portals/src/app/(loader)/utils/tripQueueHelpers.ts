import { TripVehicle } from "../types";

/**
 * Converts a 12-hour formatted time string (e.g., "05:45 AM", "01:30 PM") into minutes from midnight.
 * Returns 999999 for empty/invalid strings to push them to the end when sorting ascending.
 */
export function parseTimeToMinutes(timeStr?: string | null): number {
  if (!timeStr) return 999999;
  const match = timeStr.trim().match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (!match) return 999999;
  let hours = parseInt(match[1], 10);
  const minutes = parseInt(match[2], 10);
  const period = match[3].toUpperCase();
  if (period === "PM" && hours !== 12) hours += 12;
  if (period === "AM" && hours === 12) hours = 0;
  return hours * 60 + minutes;
}

/**
 * Identifies the upcoming active shipment deadline.
 * Excludes already dispatched/completed trips, respects bay filters,
 * and sorts chronologically to find the true earliest cut-off.
 */
export function isTripDispatched(status: TripVehicle["status"]): boolean {
  return status === "dispatched" || status === "en_route" || status === "completed";
}

export function isTripReady(status: TripVehicle["status"]): boolean {
  return status === "ready" || status === "planning";
}

/** Counts trips per loader queue bucket. */
export function summarizeQueue(trips: TripVehicle[]): { loading: number; ready: number; dispatched: number } {
  return {
    loading: trips.filter((t) => t.status === "loading").length,
    ready: trips.filter((t) => isTripReady(t.status)).length,
    dispatched: trips.filter((t) => isTripDispatched(t.status)).length,
  };
}

/** Verified/total pallets and percentage for a trip. */
export function tripProgress(trip: TripVehicle): { verified: number; total: number; percent: number } {
  const pallets = trip.stops.flatMap((s) => s.pallets);
  const verified = pallets.filter((p) => p.verified).length;
  const total = pallets.length;
  return { verified, total, percent: total > 0 ? Math.round((verified / total) * 100) : 0 };
}

export function getEarliestCutoffTrip(
  trips: TripVehicle[],
  selectedBayFilter: string = "all"
): TripVehicle | null {
  // Exclude completed or dispatched trips
  const pendingTrips = trips.filter((t) => !isTripDispatched(t.status));

  // Filter by selected bay if not "all"
  const baySpecificPending =
    selectedBayFilter !== "all"
      ? pendingTrips.filter((t) => t.bay === selectedBayFilter)
      : pendingTrips;

  // Use bay-specific candidates or fallback to all pending
  const candidateTrips = baySpecificPending.length > 0 ? baySpecificPending : pendingTrips;

  // Chronological sort
  const sorted = [...candidateTrips].sort(
    (a, b) => parseTimeToMinutes(a.cutoffTime) - parseTimeToMinutes(b.cutoffTime)
  );

  return sorted[0] || null;
}

/**
 * Filters the list of trips by active status, dock bay assignment, and user search keywords.
 */
export type TripStatusFilter = "all" | "loading" | "ready" | "dispatched";

export function filterTrips(
  trips: TripVehicle[],
  activeFilter: TripStatusFilter,
  selectedBayFilter: string,
  searchQuery: string
): TripVehicle[] {
  return trips
    .filter((t) => {
      if (selectedBayFilter !== "all" && t.bay !== selectedBayFilter) return false;
      if (activeFilter === "loading") return t.status === "loading";
      if (activeFilter === "ready") return isTripReady(t.status);
      if (activeFilter === "dispatched") return isTripDispatched(t.status);
      return true;
    })
    .filter((t) => {
      if (!searchQuery) return true;
      const q = searchQuery.toLowerCase();
      return (
        t.tripNumber.toLowerCase().includes(q) ||
        t.plateNumber.toLowerCase().includes(q) ||
        t.driverName.toLowerCase().includes(q)
      );
    });
}
