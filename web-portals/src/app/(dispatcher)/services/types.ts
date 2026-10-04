// ============================================================================
// Waypoint Dispatcher Domain & Data Types
// ============================================================================

export type OrderPriority = "High" | "Standard" | "Low";
export type TemperatureReq = "ambient" | "chilled" | "frozen";
export type TripStatus = "planning" | "loading" | "in_transit" | "completed";
export type ConnectionStatus = "online" | "delayed" | "offline";

export interface DispatcherOrder {
  id: string;
  orderNumber: string;
  storeId: string;
  storeName: string;
  storeBrand: string;
  storeAddress: string;
  storeInitial: string;
  totalWeightKg: number;
  totalVolumeM3: number;
  tempRequirement: TemperatureReq;
  priority: OrderPriority;
  deliveryWindow: string;
  status: "pending" | "assigned" | "deferred" | "in_transit" | "delivered";
  targetDeliveryDate: string;
}

export interface AssignedOrderSummary {
  id: string;
  orderNumber: string;
  storeName: string;
  weightKg: number;
  volumeM3: number;
  tempRequirement: TemperatureReq;
  deliveryWindow: string;
  stopSequence: number;
}

export interface VehicleAllocationItem {
  id: string;
  tripId: string;
  plateNumber: string;
  vehicleType: string;
  driverName: string;
  driverPhone?: string;
  maxWeightKg: number;
  currentWeightKg: number;
  maxVolumeM3: number;
  currentVolumeM3: number;
  isRefrigerated: boolean;
  image: string;
  departureTime: string;
  cutoffTime: string;
  bay: string;
  status: TripStatus;
  assignedOrders: AssignedOrderSummary[];
  weightPercent: number;
  volumePercent: number;
}

export interface CommandCenterData {
  totalOrders: number;
  ordersConfirmed: number;
  fleetCapacityPercent: number;
  vehiclesReadyCount: number;
  totalVehiclesCount: number;
  pendingDeferralsCount: number;
  firstEta: string;
  activeRoutesCount: number;
  onTimeRatePercent: number;
  orderQueue: {
    id: string;
    storeName: string;
    storeInitial: string;
    orderNumber: string;
    timeWindow: string;
    volumeM3: number;
    priority: OrderPriority;
    status: string;
    tempRequirement: TemperatureReq;
  }[];
  fleetCapacityBreakdown: {
    id: string;
    plate: string;
    model: string;
    weightPercent: number;
    volumePercent: number;
    isRefrigerated: boolean;
    image: string;
  }[];
  operationalAlerts: {
    id: string;
    type: "capacity" | "time" | "review";
    title: string;
    description: string;
    level: "warning" | "info" | "critical";
  }[];
}

export interface DeferralReviewItem {
  id: string;
  orderId: string;
  orderNumber: string;
  storeId: string;
  storeName: string;
  storeInitial: string;
  priority: OrderPriority;
  deliveryWindow: string;
  volume: number;
  weight: number;
  reason: string;
  rescheduledRun: string;
  storeNotified: boolean;
}

export interface DeferralSubmissionPayload {
  orderIds: string[];
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

export interface AutoAllocationResult {
  success: boolean;
  assignedCount: number;
  deferredCount: number;
  allocations: {
    tripId: string;
    vehiclePlate: string;
    orderCount: number;
    assignedWeightKg: number;
    assignedVolumeM3: number;
  }[];
  unassignedOrderIds: string[];
  message: string;
}
