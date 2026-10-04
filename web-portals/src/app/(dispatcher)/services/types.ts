// ============================================================================
// Waypoint Dispatcher Domain & Data Types
// ============================================================================

export type OrderPriority = "High" | "Standard" | "Low";
export type TemperatureReq = "ambient" | "chilled";
export type ConnectionStatus = "online" | "delayed" | "offline";

export interface DispatcherOrder {
  id: string;
  orderNumber: string;
  storeId: string;
  storeName: string;
  storeInitial: string;
  storeDistrict: string | null;
  storeLat: number | null;
  storeLng: number | null;
  isVanOnly: boolean;
  /** Store receiving window as "HH:MM" (24h) from stores.delivery_window_start/end. */
  windowStart: string | null;
  windowEnd: string | null;
  totalWeightKg: number;
  totalVolumeM3: number;
  itemCount: number | null;
  tempRequirement: TemperatureReq;
  priority: OrderPriority;
  deliveryWindow: string;
  targetDeliveryDate: string;
}

export interface PlanningVehicle {
  id: string;
  plateNumber: string;
  vehicleType: string;
  maxWeightKg: number;
  maxVolumeM3: number;
  isRefrigerated: boolean;
  image: string;
  /** Load already committed to this vehicle's trips on the planning date. */
  committedWeightKg: number;
  committedVolumeM3: number;
  /** Departure time ("HH:MM", 24h) of the vehicle's existing trip, if any. */
  departureTime: string | null;
  driverName: string | null;
  tripNumber: string | null;
}

export interface OrderQueueItem {
  id: string;
  storeName: string;
  storeInitial: string;
  orderNumber: string;
  timeWindow: string;
  volumeM3: number;
  priority: OrderPriority;
  status: string;
  tempRequirement: TemperatureReq;
}

export interface FleetCapacityItem {
  id: string;
  plate: string;
  model: string;
  weightPercent: number;
  volumePercent: number;
  isRefrigerated: boolean;
  image: string;
}

export interface OperationalAlert {
  id: string;
  type: "capacity" | "time" | "review";
  title: string;
  description: string;
  level: "warning" | "info" | "critical";
}

export interface CommandCenterData {
  totalOrders: number;
  pendingOrders: number;
  fleetCapacityPercent: number | null;
  vehiclesReadyCount: number;
  totalVehiclesCount: number;
  pendingDeferralsCount: number;
  firstEta: string | null;
  activeRoutesCount: number;
  onTimeRatePercent: number | null;
  orderQueue: OrderQueueItem[];
  fleetCapacityBreakdown: FleetCapacityItem[];
  operationalAlerts: OperationalAlert[];
}

export interface DeferralSubmissionPayload {
  orders: DispatcherOrder[];
  reason: string;
  rescheduledRun: string;
  notes?: string;
  deferredBy?: string;
}

export interface LiveTrackingVehicle {
  id: string;
  tripId: string;
  name: string; // e.g. 'TRK-024'
  type: string;
  driverName: string;
  stopsCount: number;
  status: "on-schedule" | "delayed" | "connectivity-issue";
  statusText: string;
  etaOrUpdate: string;
  image: string;
  color: string;
  routeDistrict: string;
  lat: number;
  lng: number;
  delayMinutes: number;
  connectionStatus: ConnectionStatus;
  lastPingAt: string;
  x?: number; // visual SVG coordinate fallback
  y?: number; // visual SVG coordinate fallback
  stops?: {
    id: string;
    sequence: number;
    storeName: string;
    address: string;
    lat: number;
    lng: number;
    status: string;
  }[];
}

export interface RouteExceptionEvent {
  id: string;
  tripId?: string;
  vehicleId?: string;
  vehiclePlate: string;
  eventTime: string;
  eventType: "stop_reached" | "delay" | "connectivity_loss" | "capacity_alert" | "schedule_risk";
  title: string;
  description: string;
  severity: "info" | "warning" | "critical" | "success";
  createdAt: string;
}

export interface TrackingKPIs {
  activeVehicles: number;
  onSchedule: number;
  delayed: number;
  connectivityIssues: number;
}
