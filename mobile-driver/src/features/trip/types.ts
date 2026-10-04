export type StopStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'FAILED';
export type TripStatus = 'planning' | 'loading' | 'en_route' | 'completed';
export type TempRequirement = 'ambient' | 'chilled';

export interface DriverProfile {
  id: string;
  fullName: string | null;
  phone: string | null;
  employeeId: string | null;
  station: string | null;
  shift: string | null;
  avatarUrl: string | null;
}

export interface Vehicle {
  id: string;
  registrationNumber: string;
  vehicleType: string | null;
  isRefrigerated: boolean;
  maxWeightKg: number | null;
}

export interface TripStop {
  id: string;
  sequence: number;
  status: StopStatus;
  estimatedArrival: string | null;
  completedAt: string | null;
  orderId: string | null;
  orderNumber: string | null;
  itemCount: number;
  weightKg: number;
  volumeM3: number;
  temp: TempRequirement;
  /** Human-readable delivery window, null when unknown. */
  window: string | null;
  storeId: string;
  storeName: string;
  address: string | null;
  accessConditions: string | null;
  isVanOnly: boolean;
  latitude: number | null;
  longitude: number | null;
  managerName: string | null;
  managerPhone: string | null;
}

export interface Trip {
  id: string;
  tripNumber: string;
  tripDate: string;
  status: TripStatus;
  bay: string | null;
  departureTime: string | null;
  dispatchedAt: string | null;
  vehicle: Vehicle | null;
  stops: TripStop[];
}

/** What the app keeps offline for the signed-in driver. */
export interface TripSnapshot {
  driver: DriverProfile;
  trip: Trip | null;
  downloadedAt: string;
}
