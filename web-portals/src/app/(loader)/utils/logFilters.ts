import { PastLogEntry } from "../types";

export type LogsPeriodFilter = "all" | "today" | "past";

function isSameLocalDay(iso: string, now: Date): boolean {
  const d = new Date(iso);
  return (
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate()
  );
}

/**
 * Filters warehouse loading logs by dispatch day (today vs. earlier) and a text query.
 */
export function filterLogs(
  logs: PastLogEntry[],
  logsFilter: LogsPeriodFilter,
  searchQuery: string,
  now: Date = new Date()
): PastLogEntry[] {
  const q = searchQuery.trim().toLowerCase();
  return logs.filter((log) => {
    if (logsFilter === "today" && !isSameLocalDay(log.dispatchedAtIso, now)) return false;
    if (logsFilter === "past" && isSameLocalDay(log.dispatchedAtIso, now)) return false;
    if (!q) return true;
    return [log.tripNumber, log.plateNumber, log.driverName, log.sealNumber, log.storesSummary].some((f) =>
      f.toLowerCase().includes(q)
    );
  });
}

export interface LogsSummary {
  tripCount: number;
  totalPallets: number;
  verifiedPallets: number;
  fullyVerifiedTrips: number;
  discrepancyCount: number;
}

/**
 * Aggregates audit KPIs from the actual loading logs.
 */
export function summarizeLogs(logs: PastLogEntry[]): LogsSummary {
  return logs.reduce<LogsSummary>(
    (acc, l) => ({
      tripCount: acc.tripCount + 1,
      totalPallets: acc.totalPallets + l.totalPallets,
      verifiedPallets: acc.verifiedPallets + l.verifiedPallets,
      fullyVerifiedTrips: acc.fullyVerifiedTrips + (l.verifiedPallets >= l.totalPallets ? 1 : 0),
      discrepancyCount: acc.discrepancyCount + (l.hasDiscrepancy ? 1 : 0),
    }),
    { tripCount: 0, totalPallets: 0, verifiedPallets: 0, fullyVerifiedTrips: 0, discrepancyCount: 0 }
  );
}
