import { PastLogEntry } from "../types";

/**
 * Filters warehouse loading logs by shift period and text query.
 */
export function filterLogs(
  logs: PastLogEntry[],
  logsFilter: "all" | "today" | "past",
  searchQuery: string
): PastLogEntry[] {
  return logs
    .filter((log) => {
      if (logsFilter === "today") {
        return (
          log.dispatchedAt.toLowerCase().includes("today") ||
          log.dispatchedAt.toLowerCase().includes("now")
        );
      }
      if (logsFilter === "past") {
        return (
          !log.dispatchedAt.toLowerCase().includes("today") &&
          !log.dispatchedAt.toLowerCase().includes("now")
        );
      }
      return true;
    })
    .filter((log) => {
      if (!searchQuery) return true;
      const q = searchQuery.toLowerCase();
      return (
        log.tripNumber.toLowerCase().includes(q) ||
        log.plateNumber.toLowerCase().includes(q) ||
        log.driverName.toLowerCase().includes(q) ||
        log.sealNumber.toLowerCase().includes(q) ||
        log.storesSummary.toLowerCase().includes(q)
      );
    });
}

/**
 * Calculates total verified pallets across a set of loading logs.
 */
export function calculateTotalAuditedPallets(logs: PastLogEntry[]): number {
  return logs.reduce((acc, l) => acc + l.verifiedPallets, 0);
}
