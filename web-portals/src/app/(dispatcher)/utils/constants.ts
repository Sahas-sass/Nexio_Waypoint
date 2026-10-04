// Operational configuration for the dispatcher (not demo data).

/** Central distribution depot – the origin of every route. */
export const DEPOT = {
  name: "Peliyagoda Central Depot",
  address: "Peliyagoda Logistics Hub, Colombo",
  lat: 6.953,
  lng: 79.882,
};

/** Planning assumptions used by the window-feasibility check. */
export const PLANNING = {
  /** Default depot departure (06:00) when a vehicle has no trip yet. */
  defaultDepartureMinutes: 6 * 60,
  /** Average urban speed used to estimate travel time between stops. */
  averageSpeedKmh: 25,
  /** Unloading/handover time at each stop. */
  serviceMinutes: 20,
  /** Leg time when a store has no coordinates. */
  defaultLegMinutes: 30,
};

/** Utilisation (%) above which a vehicle is flagged as near capacity. */
export const NEAR_CAPACITY_PERCENT = 85;

export const DEFERRAL_REASONS = [
  "Fleet Capacity",
  "Weight Limit",
  "Vehicle Unavailable",
  "Window Conflict",
  "Reefer Shortage",
] as const;
