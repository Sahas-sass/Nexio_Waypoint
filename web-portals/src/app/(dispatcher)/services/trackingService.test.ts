import { beforeEach, describe, expect, it, vi } from "vitest";
import { createSupabaseMock } from "./testSupabaseMock";

const mock = vi.hoisted(() => ({ current: null as unknown as ReturnType<typeof createSupabaseMock> }));
vi.mock("@/lib/supabaseClient", async () => {
  const { createSupabaseMock } = await import("./testSupabaseMock");
  mock.current = createSupabaseMock();
  return { supabase: mock.current.client };
});

import { fetchLiveTrackingFleet, fetchRouteExceptions, subscribeToTelemetry } from "./trackingService";

describe("fetchLiveTrackingFleet", () => {
  beforeEach(() => mock.current.reset());
  it("returns en-route trips with GPS and KPIs", async () => {
    mock.current.queue("trips", {
      data: [
        { id: "t1", trip_number: "TRIP 1", status: "en_route", current_lat: 6.9, current_lng: 79.8, delay_minutes: 5, connection_status: "online", eta_time: null, last_ping_at: null, current_district: null, vehicles: { registration_number: "TRK-1", vehicle_type: "Truck", is_refrigerated: false }, driver: null, trip_stops: [] },
        { id: "t2", trip_number: "TRIP 2", status: "en_route", current_lat: null, current_lng: null, delay_minutes: 0, connection_status: "online", eta_time: null, last_ping_at: null, current_district: null, vehicles: null, driver: null, trip_stops: [] },
      ],
    });
    const res = await fetchLiveTrackingFleet();
    expect(res.vehicles.map((v) => v.name)).toEqual(["TRK-1"]);
    expect(res.kpis).toEqual({ activeVehicles: 1, onSchedule: 0, delayed: 1, connectivityIssues: 0 });
    expect(mock.current.opsOf("trips")).toContainEqual({ method: "eq", args: ["status", "en_route"] });
  });
  it("throws on error instead of returning demo data", async () => {
    mock.current.queue("trips", { error: { message: "offline" } });
    await expect(fetchLiveTrackingFleet()).rejects.toThrow("offline");
  });
});

describe("fetchRouteExceptions", () => {
  beforeEach(() => mock.current.reset());
  it("maps rows and limits results", async () => {
    mock.current.queue("route_exceptions", {
      data: [{ id: "e1", trip_id: "t1", vehicle_id: null, vehicle_plate: "TRK-1", event_time: "07:00", event_type: "delay", title: "x", description: "y", severity: "warning", created_at: "z" }],
    });
    const res = await fetchRouteExceptions(5);
    expect(res[0]).toMatchObject({ id: "e1", vehiclePlate: "TRK-1", severity: "warning" });
    expect(mock.current.opsOf("route_exceptions")).toContainEqual({ method: "limit", args: [5] });
  });
  it("throws on error", async () => {
    mock.current.queue("route_exceptions", { error: { message: "nope" } });
    await expect(fetchRouteExceptions()).rejects.toThrow("nope");
  });
});

describe("subscribeToTelemetry", () => {
  it("returns an unsubscribe function", () => {
    const off = subscribeToTelemetry(() => undefined, () => undefined);
    expect(typeof off).toBe("function");
    expect(() => off()).not.toThrow();
  });
});
