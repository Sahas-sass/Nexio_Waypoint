import { describe, expect, it } from "vitest";
import { committedLoad, mapOrderRow, mapVehicleRow, to24h, toNumber } from "./mappers";

describe("toNumber / to24h", () => {
  it("coerces numeric strings and guards junk", () => {
    expect(toNumber("2.5")).toBe(2.5);
    expect(toNumber(null)).toBe(0);
    expect(toNumber("abc")).toBe(0);
  });
  it("converts 12h strings to 24h", () => {
    expect(to24h("06:30 AM")).toBe("06:30");
    expect(to24h("1:15 PM")).toBe("13:15");
    expect(to24h("12:00 AM")).toBe("00:00");
    expect(to24h("07:45")).toBe("07:45");
    expect(to24h(null)).toBeNull();
    expect(to24h("later")).toBeNull();
  });
});

describe("mapOrderRow", () => {
  it("maps store constraints from the embedded store", () => {
    const o = mapOrderRow({
      id: "o1",
      order_number: "ORD-1",
      store_id: "s1",
      total_weight_kg: "420",
      total_volume_m3: 2.4,
      temp_requirement: "chilled",
      priority: "High",
      delivery_window: null,
      target_delivery_date: "2026-10-05",
      item_count: 18,
      stores: [{ name: "Fresh Store #22", district: "Colombo", latitude: "6.87", longitude: 79.88, is_van_only: true, delivery_window_start: "08:00:00", delivery_window_end: "08:30:00" }],
    });
    expect(o).toMatchObject({
      storeName: "Fresh Store #22",
      storeInitial: "F",
      storeLat: 6.87,
      storeLng: 79.88,
      isVanOnly: true,
      windowStart: "08:00",
      windowEnd: "08:30",
      totalWeightKg: 420,
      totalVolumeM3: 2.4,
      itemCount: 18,
      tempRequirement: "chilled",
      priority: "High",
      deliveryWindow: "08:00 - 08:30",
    });
  });
  it("does not invent data when the store is missing", () => {
    const o = mapOrderRow({
      id: "abcdef123456",
      order_number: null,
      store_id: "s1",
      total_weight_kg: null,
      total_volume_m3: null,
      temp_requirement: "weird",
      priority: "Urgent",
      delivery_window: null,
      target_delivery_date: null,
      stores: null,
    });
    expect(o).toMatchObject({
      orderNumber: "abcdef12",
      storeName: "Unknown store",
      storeInitial: "",
      storeLat: null,
      isVanOnly: false,
      windowStart: null,
      totalWeightKg: 0,
      tempRequirement: "ambient",
      priority: "Standard",
      deliveryWindow: "No window set",
      itemCount: null,
    });
  });
});

describe("committedLoad / mapVehicleRow", () => {
  const trips = [
    {
      trip_number: "TRIP 1",
      departure_time: "06:30 AM",
      driver: { full_name: "Kasun Perera" },
      trip_stops: [{ orders: { total_weight_kg: 100, total_volume_m3: 1 } }, { orders: [{ total_weight_kg: "50", total_volume_m3: "0.5" }] }, { orders: null }],
    },
  ];
  it("sums order load across trip stops", () => {
    expect(committedLoad(trips)).toEqual({ weightKg: 150, volumeM3: 1.5 });
    expect(committedLoad([])).toEqual({ weightKg: 0, volumeM3: 0 });
  });
  it("maps a vehicle with its committed trip load", () => {
    const v = mapVehicleRow(
      { id: "v1", registration_number: "VAN-012", vehicle_type: "Toyota HiAce Van", max_weight_kg: 1200, max_volume_m3: "8.5", is_refrigerated: false },
      trips,
    );
    expect(v).toMatchObject({
      plateNumber: "VAN-012",
      maxVolumeM3: 8.5,
      image: "/van_express.jpg",
      committedWeightKg: 150,
      departureTime: "06:30",
      driverName: "Kasun Perera",
      tripNumber: "TRIP 1",
    });
  });
  it("leaves trip fields empty for an idle vehicle", () => {
    const v = mapVehicleRow({ id: "v2", registration_number: "TRK-1", vehicle_type: null, max_weight_kg: null, max_volume_m3: null, is_refrigerated: true }, []);
    expect(v).toMatchObject({ departureTime: null, driverName: null, tripNumber: null, committedWeightKg: 0, image: "/truck_reefer.jpg" });
  });
});
