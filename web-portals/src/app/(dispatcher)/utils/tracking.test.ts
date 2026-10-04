import { describe, expect, it } from "vitest";
import { averageDelay, computeTrackingKpis, latestPing, mapRouteException, mapTripToTrackingVehicle, trackingStatus, type TrackingTripRow } from "./tracking";
import type { LiveTrackingVehicle } from "../services/types";

const now = new Date("2026-10-04T08:00:00Z");
const trip = (t: Partial<TrackingTripRow> = {}): TrackingTripRow => ({
  id: "t1",
  trip_number: "TRIP 1042",
  status: "en_route",
  current_district: "Central Market",
  current_lat: "6.91",
  current_lng: 79.86,
  delay_minutes: 0,
  connection_status: "online",
  eta_time: "7:42 AM",
  last_ping_at: "2026-10-04T07:54:00Z",
  vehicles: { registration_number: "TRK-024", vehicle_type: "Isuzu NPR Heavy Freight", is_refrigerated: true },
  driver: [{ full_name: "Kasun Perera" }],
  trip_stops: [
    { id: "s2", stop_sequence: 2, status: "PENDING", stores: { name: "B", address: "b st", latitude: 6.8, longitude: 79.8 } },
    { id: "s1", stop_sequence: 1, status: "COMPLETED", stores: { name: "A", address: "a st", latitude: "6.9", longitude: "79.9" } },
    { id: "s3", stop_sequence: 3, status: "PENDING", stores: { name: "No GPS", address: null, latitude: null, longitude: null } },
  ],
  ...t,
});

describe("trackingStatus", () => {
  it("prioritises offline over delay", () => {
    expect(trackingStatus("offline", 10)).toBe("connectivity-issue");
    expect(trackingStatus("online", 5)).toBe("delayed");
    expect(trackingStatus("delayed", 0)).toBe("delayed");
    expect(trackingStatus("online", 0)).toBe("on-schedule");
  });
});

describe("mapTripToTrackingVehicle", () => {
  it("maps telemetry, driver and ordered stops with coordinates", () => {
    const v = mapTripToTrackingVehicle(trip(), now)!;
    expect(v).toMatchObject({
      name: "TRK-024",
      driverName: "Kasun Perera",
      stopsCount: 3,
      status: "on-schedule",
      etaOrUpdate: "ETA 7:42 AM",
      image: "/truck_reefer.jpg",
      lat: 6.91,
      lng: 79.86,
    });
    expect(v.stops?.map((s) => s.id)).toEqual(["s1", "s2"]);
  });
  it("shows last update time for offline vehicles", () => {
    const v = mapTripToTrackingVehicle(trip({ connection_status: "offline" }), now)!;
    expect(v.status).toBe("connectivity-issue");
    expect(v.etaOrUpdate).toBe("Last update 6 min ago");
  });
  it("skips trips without a GPS fix and labels missing data honestly", () => {
    expect(mapTripToTrackingVehicle(trip({ current_lat: null }), now)).toBeNull();
    const v = mapTripToTrackingVehicle(trip({ driver: null, eta_time: null, connection_status: "bogus" }), now)!;
    expect(v.driverName).toBe("Unassigned driver");
    expect(v.etaOrUpdate).toBe("ETA pending");
    expect(v.connectionStatus).toBe("online");
  });
});

describe("KPIs", () => {
  const vs = [
    { status: "on-schedule", delayMinutes: 0, lastPingAt: "2026-10-04T07:00:00Z" },
    { status: "delayed", delayMinutes: 12, lastPingAt: "2026-10-04T07:30:00Z" },
    { status: "delayed", delayMinutes: 5, lastPingAt: "" },
    { status: "connectivity-issue", delayMinutes: 0, lastPingAt: "bad" },
  ] as LiveTrackingVehicle[];
  it("counts statuses", () => {
    expect(computeTrackingKpis(vs)).toEqual({ activeVehicles: 4, onSchedule: 1, delayed: 2, connectivityIssues: 1 });
  });
  it("averages delay of delayed vehicles", () => {
    expect(averageDelay(vs)).toBe(9);
    expect(averageDelay([])).toBe(0);
  });
  it("finds the most recent ping", () => {
    expect(latestPing(vs)).toBe("2026-10-04T07:30:00.000Z");
    expect(latestPing([])).toBeNull();
  });
});

describe("mapRouteException", () => {
  it("maps a row and defaults severity", () => {
    expect(
      mapRouteException({
        id: "e1",
        trip_id: null,
        vehicle_id: "v1",
        vehicle_plate: "VAN-012",
        event_time: "07:18",
        event_type: "delay",
        title: "Delayed",
        description: "Traffic",
        severity: null,
        created_at: "2026-10-04T01:00:00Z",
      }),
    ).toEqual({
      id: "e1",
      tripId: undefined,
      vehicleId: "v1",
      vehiclePlate: "VAN-012",
      eventTime: "07:18",
      eventType: "delay",
      title: "Delayed",
      description: "Traffic",
      severity: "info",
      createdAt: "2026-10-04T01:00:00Z",
    });
  });
});
