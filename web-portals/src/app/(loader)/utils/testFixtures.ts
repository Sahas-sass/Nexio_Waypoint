import { PalletItem, PastLogEntry, StopGroup, TripVehicle } from "../types";

export function makePallet(overrides: Partial<PalletItem> = {}): PalletItem {
  return {
    id: "p1",
    sku: "SKU-1",
    name: "Milk",
    category: "ambient",
    weightKg: 100,
    verified: false,
    ...overrides,
  };
}

export function makeStop(overrides: Partial<StopGroup> = {}): StopGroup {
  return {
    stopId: "s1",
    stopNumber: 1,
    loadSequence: 1,
    storeId: "A111111",
    storeName: "Store A",
    location: "Colombo",
    pallets: [],
    ...overrides,
  };
}

export function makeTrip(overrides: Partial<TripVehicle> = {}): TripVehicle {
  return {
    id: "t1",
    tripNumber: "TRIP 1",
    bay: "Bay 01",
    status: "loading",
    statusText: "LOADING IN PROGRESS",
    plateNumber: "TRK-1",
    vehicleModel: "TRK-1 (Truck)",
    vehicleType: "Truck",
    driverName: "Driver",
    driverPhone: "+94",
    departureTime: "06:30 AM",
    cutoffTime: "05:45 AM",
    maxWeightTons: 5,
    currentWeightTons: 0.2,
    image: "/truck_heavy.jpg",
    stops: [],
    ...overrides,
  };
}

export function makeLog(overrides: Partial<PastLogEntry> = {}): PastLogEntry {
  return {
    id: "l1",
    tripNumber: "TRIP 1",
    bay: "Bay 01",
    plateNumber: "TRK-1",
    vehicleModel: "TRK-1 (Truck)",
    vehicleType: "Truck",
    driverName: "Kasun",
    driverPhone: "",
    dispatchedAt: "Oct 4, 08:00",
    dispatchedAtIso: "2026-10-04T08:00:00",
    shift: "",
    sealNumber: "SEAL-1",
    totalPallets: 4,
    verifiedPallets: 4,
    totalWeightKg: 400,
    storesCount: 2,
    storesSummary: "Store A • Store B",
    status: "dispatched",
    signature: "Loader",
    hasDiscrepancy: false,
    ...overrides,
  };
}
