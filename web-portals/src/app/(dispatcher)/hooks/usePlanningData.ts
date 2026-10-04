"use client";

import { useAsync } from "./useAsync";
import { fetchPendingOrders, fetchPlanningVehicles } from "../services/planningService";

/** Pending orders and the active fleet (with committed load) for a delivery date. */
export function usePlanningData(planningDate: string) {
  return useAsync(async () => {
    const [orders, vehicles] = await Promise.all([fetchPendingOrders(planningDate), fetchPlanningVehicles(planningDate)]);
    return { orders, vehicles };
  }, planningDate);
}
