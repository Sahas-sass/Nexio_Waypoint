export interface PalletItem {
  id: string;
  sku: string;
  name: string;
  category: "ambient" | "chilled" | "frozen";
  tempReq?: string;
  weightKg: number;
  verified: boolean;
  verifiedAt?: string;
  orderId?: string;
  stopId?: string;
}

export interface StopGroup {
  stopId: string;
  stopNumber: number; // 1 = first delivery dropoff, 4 = last delivery dropoff
  loadSequence: number; // 1 = first loaded into truck bed (LIFO), 4 = loaded last (near doors)
  storeId: string;
  storeName: string;
  location: string;
  orderId?: string;
  rawStoreId?: string;
  pallets: PalletItem[];
}

export interface TripVehicle {
  id: string;
  tripNumber: string;
  bay: string;
  status: "loading" | "ready" | "planning" | "dispatched" | "en_route" | "completed";
  statusText: string;
  plateNumber: string;
  vehicleModel: string;
  vehicleType: string;
  driverName: string;
  driverPhone: string;
  departureTime: string;
  cutoffTime: string;
  maxWeightTons: number;
  currentWeightTons: number;
  image: string;
  stops: StopGroup[];
}

export interface PastLogEntry {
  id: string;
  tripNumber: string;
  bay: string;
  plateNumber: string;
  vehicleModel: string;
  vehicleType: string;
  driverName: string;
  driverPhone: string;
  dispatchedAt: string; // human readable
  dispatchedAtIso: string; // raw timestamp used for date filtering
  shift: string;
  sealNumber: string;
  totalPallets: number;
  verifiedPallets: number;
  totalWeightKg: number;
  storesCount: number;
  storesSummary: string;
  status: "dispatched" | "completed" | "delayed";
  signature: string;
  hasDiscrepancy?: boolean;
  discrepancyNote?: string;
}

export interface ReeferTempCheck {
  chilledTempC?: number;
  frozenTempC?: number;
  isCompliant: boolean;
}

export type ExceptionReasonCode =
  | "CARTON_DAMAGED"
  | "LEAKAGE_DETECTED"
  | "TEMPERATURE_EXCURSION"
  | "MISSING_FROM_STAGING"
  | "OTHER";

export interface ExceptionSubmission {
  orderId?: string;
  storeId?: string;
  reasonCode: ExceptionReasonCode;
  actionTaken: string;
  palletSku?: string;
}
