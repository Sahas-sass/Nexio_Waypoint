import type { StopStatus, TripStop } from "../types";

/** Today's stops for the store, active ones first, then by estimated arrival. */
export function todaysStops(stops: TripStop[], today: string): TripStop[] {
  const rank = (s: StopStatus) => (s === "IN_PROGRESS" ? 0 : s === "PENDING" ? 1 : 2);
  return stops
    .filter((s) => s.trip?.trip_date === today)
    .sort(
      (a, b) =>
        rank(a.status) - rank(b.status) ||
        (a.estimated_arrival ?? "9999").localeCompare(b.estimated_arrival ?? "9999") ||
        a.stop_sequence - b.stop_sequence,
    );
}

export const STOP_STATUS_LABEL: Record<StopStatus, string> = {
  PENDING: "Scheduled",
  IN_PROGRESS: "Arriving now",
  COMPLETED: "Delivered",
  FAILED: "Delivery failed",
};

export function stopStatusLabel(status: string): string {
  return STOP_STATUS_LABEL[status as StopStatus] ?? status;
}

const TRIP_STATUS_LABEL: Record<string, string> = {
  planning: "Being planned",
  loading: "Loading at warehouse",
  en_route: "On the road",
  completed: "Trip completed",
};

export function tripStatusLabel(status: string | null | undefined): string {
  if (!status) return "Unknown";
  return TRIP_STATUS_LABEL[status] ?? status;
}
