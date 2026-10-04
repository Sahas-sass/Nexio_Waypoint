import { describe, it, expect } from "vitest";
import {
  firstOf,
  deriveStatusText,
  palletBelongsToStop,
  buildStopGroups,
  mapTrip,
  mapLoadingLog,
  PalletRow,
  StopRow,
  TripRow,
  LoadingLogRow,
} from "./tripMapping";

const stop = (id: string, seq: number, extra: Partial<StopRow> = {}): StopRow => ({
  id,
  trip_id: "t1",
  stop_sequence: seq,
  order_id: `o-${id}`,
  store_id: `store-${id}-uuid`,
  stores: { id: `store-${id}-uuid`, name: `Store ${id}`, address: `Addr ${id}` },
  ...extra,
});
const pallet = (id: string, extra: Partial<PalletRow> = {}): PalletRow => ({
  id,
  trip_id: "t1",
  stop_id: null,
  order_id: null,
  sku: `SKU-${id}`,
  name: `Pallet ${id}`,
  category: "chilled",
  temp_req: null,
  weight_kg: "250",
  is_verified: null,
  verified_at: null,
  ...extra,
});

describe("firstOf", () => {
  it("unwraps arrays, objects and nulls", () => {
    expect(firstOf([1, 2])).toBe(1);
    expect(firstOf({ a: 1 })).toEqual({ a: 1 });
    expect(firstOf(null)).toBeUndefined();
  });
});

describe("deriveStatusText", () => {
  it("maps statuses", () => {
    expect(deriveStatusText("loading")).toBe("LOADING IN PROGRESS");
    expect(deriveStatusText("planning")).toBe("READY TO LOAD");
    expect(deriveStatusText("en_route")).toBe("SEALED & DISPATCHED");
    expect(deriveStatusText("completed")).toBe("COMPLETED");
    expect(deriveStatusText("weird")).toBe("SCHEDULED");
  });
});

describe("palletBelongsToStop", () => {
  it("matches by stop_id first, else by order", () => {
    const s = stop("a", 1);
    expect(palletBelongsToStop(pallet("1", { stop_id: "a" }), s)).toBe(true);
    expect(palletBelongsToStop(pallet("1", { stop_id: "b", order_id: "o-a" }), s)).toBe(false);
    expect(palletBelongsToStop(pallet("1", { order_id: "o-a" }), s)).toBe(true);
    expect(palletBelongsToStop(pallet("1"), s)).toBe(false);
  });
});

describe("buildStopGroups", () => {
  it("orders stops in reverse-delivery (LIFO) load sequence without duplicating pallets", () => {
    const groups = buildStopGroups(
      [stop("a", 1), stop("b", 2)],
      [pallet("1", { stop_id: "a" }), pallet("2", { stop_id: "b", is_verified: true })]
    );
    expect(groups.map((g) => [g.stopId, g.stopNumber, g.loadSequence])).toEqual([
      ["b", 2, 1],
      ["a", 1, 2],
    ]);
    expect(groups[0].pallets.map((p) => p.id)).toEqual(["2"]);
    expect(groups[0].pallets[0]).toMatchObject({ verified: true, weightKg: 250, orderId: "o-b", stopId: "b" });
    expect(groups[1]).toMatchObject({ storeId: "STORE-A", storeName: "Store a", location: "Addr a", rawStoreId: "store-a-uuid" });
  });
  it("labels missing store data honestly", () => {
    const [g] = buildStopGroups([stop("x", 1, { stores: null, store_id: null })], []);
    expect(g).toMatchObject({ storeId: "", storeName: "Unknown store", location: "", pallets: [] });
  });
});

describe("mapTrip", () => {
  const row: TripRow = {
    id: "t1",
    trip_number: "TRIP 1042",
    bay: "Bay 04",
    status: "loading",
    departure_time: "06:30 AM",
    cutoff_time: "05:45 AM",
    vehicles: [{ registration_number: "VAN-012", vehicle_type: "Toyota HiAce Van", max_weight_kg: 1200, is_refrigerated: false }],
    driver: { full_name: "Kasun Perera", phone: "+94771" },
  };
  it("maps a full trip and computes weight from pallets", () => {
    const trip = mapTrip(row, [stop("a", 1), { ...stop("z", 1), trip_id: "other" }], [
      pallet("1", { stop_id: "a" }),
      pallet("2", { stop_id: "a", weight_kg: 500 }),
    ]);
    expect(trip).toMatchObject({
      tripNumber: "TRIP 1042",
      plateNumber: "VAN-012",
      vehicleModel: "VAN-012 (Toyota HiAce Van)",
      driverName: "Kasun Perera",
      maxWeightTons: 1.2,
      currentWeightTons: 0.75,
      image: "/van_express.jpg",
      statusText: "LOADING IN PROGRESS",
    });
    expect(trip.stops).toHaveLength(1);
  });
  it("does not invent data for missing vehicle/driver/times", () => {
    const trip = mapTrip({ ...row, vehicles: null, driver: null, bay: null, departure_time: null, cutoff_time: null }, [], []);
    expect(trip).toMatchObject({
      plateNumber: "Unassigned",
      vehicleModel: "No vehicle assigned",
      driverName: "Unassigned driver",
      driverPhone: "",
      bay: "",
      departureTime: "",
      cutoffTime: "",
      maxWeightTons: 0,
      currentWeightTons: 0,
      image: "/truck_heavy.jpg",
    });
  });
});

describe("mapLoadingLog", () => {
  it("maps a row and keeps the ISO timestamp", () => {
    const r: LoadingLogRow = {
      id: "l1",
      trip_number: "TRIP 1",
      bay: "Bay 01",
      plate_number: "TRK-1",
      vehicle_model: "m",
      vehicle_type: "t",
      driver_name: "d",
      driver_phone: null,
      dispatched_at: "2026-10-02T18:04:34Z",
      shift: null,
      seal_number: "S-1",
      total_pallets: 4,
      verified_pallets: 3,
      total_weight_kg: "900",
      stores_count: 2,
      stores_summary: null,
      status: "dispatched",
      signature: "sig",
      has_discrepancy: null,
      discrepancy_note: null,
    };
    const log = mapLoadingLog(r);
    expect(log).toMatchObject({
      dispatchedAtIso: "2026-10-02T18:04:34Z",
      driverPhone: "",
      shift: "",
      totalWeightKg: 900,
      storesSummary: "",
      hasDiscrepancy: false,
      discrepancyNote: undefined,
    });
    expect(log.dispatchedAt).not.toBe("");
  });
});
