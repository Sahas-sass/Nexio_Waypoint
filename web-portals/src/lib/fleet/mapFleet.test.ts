import { describe, expect, it } from "vitest";
import { computeKpis, lastUpdateText, mapRouteException, mapTripToVehicle, trackingStatus, type FleetTripRow } from "./mapFleet";
import { VEHICLE_IMAGES } from "./vehicleImage";

const now = new Date("2026-10-04T08:00:00Z");

const trip: FleetTripRow = {
  id: "t1",
  trip_number: "TRIP 1",
  status: "en_route",
  current_district: "Colombo",
  current_lat: "6.9",
  current_lng: "79.86",
  delay_minutes: 0,
  connection_status: "online",
  eta_time: "7:42 AM",
  last_ping_at: "2026-10-04T07:50:00Z",
  vehicles: { registration_number: "VAN-1", vehicle_type: "Express Van", is_refrigerated: false },
  driver: [{ full_name: "Driver One" }],
  trip_stops: [
    { id: "s2", stop_sequence: 2, status: "PENDING", stores: { name: "B", address: "b st", latitude: 6.8, longitude: 79.8 } },
    { id: "s1", stop_sequence: 1, status: "COMPLETED", stores: [{ name: "A", address: null, latitude: "6.7", longitude: "79.7" }] },
    { id: "s3", stop_sequence: 3, status: "PENDING", stores: { name: "No coords", address: null, latitude: null, longitude: null } },
  ],
};

describe("trackingStatus", () => {
  it("prioritises connectivity, then delay", () => {
    expect(trackingStatus("offline", 10)).toBe("connectivity-issue");
    expect(trackingStatus("online", 5)).toBe("delayed");
    expect(trackingStatus("delayed", 0)).toBe("delayed");
    expect(trackingStatus("online", 0)).toBe("on-schedule");
  });
});

describe("lastUpdateText", () => {
  it("formats minutes and hours", () => {
    expect(lastUpdateText("2026-10-04T07:54:00Z", now)).toBe("Last update 6 min ago");
    expect(lastUpdateText("2026-10-04T05:00:00Z", now)).toBe("Last update 3 h ago");
    expect(lastUpdateText(null, now)).toBe("No update received");
  });
});

describe("mapTripToVehicle", () => {
  it("maps DB rows using store coordinates from the database", () => {
    const v = mapTripToVehicle(trip, now)!;
    expect(v).toMatchObject({
      id: "t1",
      name: "VAN-1",
      driverName: "Driver One",
      stopsCount: 3,
      status: "on-schedule",
      etaOrUpdate: "ETA 7:42 AM",
      image: VEHICLE_IMAGES.van,
      lat: 6.9,
      lng: 79.86,
    });
    expect(v.stops?.map((s) => [s.id, s.lat, s.lng])).toEqual([
      ["s1", 6.7, 79.7],
      ["s2", 6.8, 79.8],
    ]);
  });

  it("returns null when the trip has no position", () => {
    expect(mapTripToVehicle({ ...trip, current_lat: null }, now)).toBeNull();
  });

  it("shows last update for offline vehicles and handles missing relations", () => {
    const v = mapTripToVehicle(
      { ...trip, connection_status: "offline", vehicles: null, driver: null, trip_stops: null, eta_time: null },
      now
    )!;
    expect(v.etaOrUpdate).toBe("Last update 10 min ago");
    expect(v.driverName).toBe("Unassigned driver");
    expect(v.name).toBe("TRIP 1");
    expect(v.image).toBe(VEHICLE_IMAGES.heavy);
    expect(v.stops).toEqual([]);
  });

  it("treats unknown connection status as online", () => {
    expect(mapTripToVehicle({ ...trip, connection_status: "weird", eta_time: null }, now)).toMatchObject({
      connectionStatus: "online",
      etaOrUpdate: "ETA pending",
    });
  });
});

describe("computeKpis", () => {
  it("counts vehicles per status", () => {
    const a = mapTripToVehicle(trip, now)!;
    const b = mapTripToVehicle({ ...trip, id: "t2", delay_minutes: 4 }, now)!;
    const c = mapTripToVehicle({ ...trip, id: "t3", connection_status: "offline" }, now)!;
    expect(computeKpis([a, b, c])).toEqual({ activeVehicles: 3, onSchedule: 1, delayed: 1, connectivityIssues: 1 });
    expect(computeKpis([])).toEqual({ activeVehicles: 0, onSchedule: 0, delayed: 0, connectivityIssues: 0 });
  });
});

describe("mapRouteException", () => {
  it("maps snake_case rows and defaults severity", () => {
    expect(
      mapRouteException({
        id: "e1",
        trip_id: null,
        vehicle_id: "v1",
        vehicle_plate: "TRK-1",
        event_time: "08:00",
        event_type: "delay",
        title: "Late",
        description: "Traffic",
        severity: null,
        created_at: "2026-10-04T08:00:00Z",
      })
    ).toEqual({
      id: "e1",
      tripId: undefined,
      vehicleId: "v1",
      vehiclePlate: "TRK-1",
      eventTime: "08:00",
      eventType: "delay",
      title: "Late",
      description: "Traffic",
      severity: "info",
      createdAt: "2026-10-04T08:00:00Z",
    });
  });
});
