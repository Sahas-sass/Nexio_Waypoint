"use client";

import { useEffect, useState } from "react";
import { useAsync } from "./useAsync";
import { fetchLiveTrackingFleet, fetchRouteExceptions, subscribeToTelemetry } from "../services/trackingService";
import type { RouteExceptionEvent } from "../services/types";

/** Live fleet + route exceptions, refreshed by Supabase realtime events. */
export function useLiveTracking() {
  const fleet = useAsync(fetchLiveTrackingFleet, "fleet");
  const exceptions = useAsync(() => fetchRouteExceptions(), "exceptions");
  const [liveExceptions, setLiveExceptions] = useState<RouteExceptionEvent[]>([]);
  const { reload: reloadFleet } = fleet;

  useEffect(() => {
    return subscribeToTelemetry(
      () => reloadFleet(),
      (event) => setLiveExceptions((prev) => [event, ...prev]),
    );
  }, [reloadFleet]);

  const reload = () => {
    fleet.reload();
    exceptions.reload();
    setLiveExceptions([]);
  };

  return {
    vehicles: fleet.data?.vehicles ?? [],
    kpis: fleet.data?.kpis ?? null,
    exceptions: [...liveExceptions, ...(exceptions.data ?? [])],
    loading: fleet.loading || exceptions.loading,
    error: fleet.error ?? exceptions.error,
    reload,
  };
}
