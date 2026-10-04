import { describe, it, expect, vi, beforeEach } from "vitest";

// Chainable query-builder mock: every call is recorded; awaiting resolves to the queued result
type Result = { data?: unknown; error?: unknown };
const calls: { table: string; method: string; args: unknown[] }[] = [];
const results: Record<string, Result[]> = {};

function builder(table: string) {
  const next = (): Result => results[table]?.shift() ?? { data: null, error: null };
  const proxy: Record<string, unknown> = {};
  for (const m of ["select", "insert", "update", "eq", "in", "order", "single"]) {
    proxy[m] = (...args: unknown[]) => {
      calls.push({ table, method: m, args });
      return proxy;
    };
  }
  proxy.then = (resolve: (r: Result) => unknown, reject: (e: unknown) => unknown) =>
    Promise.resolve(next()).then(resolve, reject);
  return proxy;
}

vi.mock("@/lib/supabaseClient", () => ({
  supabase: { from: (table: string) => builder(table) },
}));

import {
  fetchTripsWithDetails,
  updatePalletVerification,
  createPalletException,
  finalizeAndDispatchTrip,
  fetchPastLogs,
} from "./loaderService";
import { makePallet, makeStop, makeTrip } from "../utils/testFixtures";

const queue = (table: string, ...r: Result[]) => {
  results[table] = [...(results[table] ?? []), ...r];
};
const callsFor = (table: string, method: string) => calls.filter((c) => c.table === table && c.method === method);

const logRow = {
  id: "log-1",
  trip_number: "TRIP 1",
  bay: "Bay 01",
  plate_number: "TRK-1",
  vehicle_model: "m",
  vehicle_type: "t",
  driver_name: "Driver",
  driver_phone: "+94",
  dispatched_at: "2026-10-04T06:00:00Z",
  shift: null,
  seal_number: "SEAL-1",
  total_pallets: 2,
  verified_pallets: 1,
  total_weight_kg: 200,
  stores_count: 1,
  stores_summary: "Store A",
  status: "dispatched",
  signature: "Loader",
  has_discrepancy: true,
  discrepancy_note: "note",
};

beforeEach(() => {
  calls.length = 0;
  for (const k of Object.keys(results)) delete results[k];
});

describe("fetchTripsWithDetails", () => {
  it("returns [] without further queries when there are no trips", async () => {
    queue("trips", { data: [], error: null });
    expect(await fetchTripsWithDetails()).toEqual([]);
    expect(callsFor("trip_stops", "select")).toHaveLength(0);
  });

  it("assembles trips, stops and pallets", async () => {
    queue("trips", {
      data: [
        {
          id: "t1",
          trip_number: "TRIP 1",
          bay: "Bay 01",
          status: "loading",
          departure_time: "06:30 AM",
          cutoff_time: "05:45 AM",
          vehicles: { registration_number: "TRK-1", vehicle_type: "Reefer", max_weight_kg: 5000, is_refrigerated: true },
          driver: { full_name: "Kasun", phone: "+94" },
        },
      ],
      error: null,
    });
    queue("trip_stops", {
      data: [{ id: "s1", trip_id: "t1", stop_sequence: 1, order_id: "o1", store_id: "st1", stores: { id: "st1", name: "Store", address: "A" } }],
      error: null,
    });
    queue("pallets", {
      data: [{ id: "p1", trip_id: "t1", stop_id: "s1", order_id: "o1", sku: "S", name: "N", category: "chilled", temp_req: null, weight_kg: 100, is_verified: false, verified_at: null }],
      error: null,
    });
    const [trip] = await fetchTripsWithDetails();
    expect(trip).toMatchObject({ id: "t1", plateNumber: "TRK-1", image: "/truck_reefer.jpg", currentWeightTons: 0.1 });
    expect(trip.stops[0].pallets).toHaveLength(1);
    expect(callsFor("pallets", "in")[0].args).toEqual(["trip_id", ["t1"]]);
  });

  it("throws Supabase errors", async () => {
    queue("trips", { data: null, error: { message: "denied" } });
    await expect(fetchTripsWithDetails()).rejects.toEqual({ message: "denied" });
  });
});

describe("updatePalletVerification", () => {
  it("sets verified fields and clears them when unverifying", async () => {
    queue("pallets", { error: null }, { error: null });
    await updatePalletVerification("p1", true, "u1");
    await updatePalletVerification("p1", false, "u1");
    const [on, off] = callsFor("pallets", "update").map((c) => c.args[0] as Record<string, unknown>);
    expect(on).toMatchObject({ is_verified: true, verified_by: "u1" });
    expect(typeof on.verified_at).toBe("string");
    expect(off).toEqual({ is_verified: false, verified_at: null, verified_by: null });
    expect(callsFor("pallets", "eq")[0].args).toEqual(["id", "p1"]);
  });
  it("throws on error", async () => {
    queue("pallets", { error: { message: "nope" } });
    await expect(updatePalletVerification("p1", true)).rejects.toBeTruthy();
  });
});

describe("createPalletException", () => {
  it("inserts the exception with the SKU prefixed", async () => {
    queue("exceptions", { error: null });
    await createPalletException({ orderId: "o1", storeId: "s1", reasonCode: "LEAKAGE_DETECTED", actionTaken: "held back", palletSku: "CH-1" });
    expect(callsFor("exceptions", "insert")[0].args[0]).toEqual({
      order_id: "o1",
      store_id: "s1",
      reason_code: "LEAKAGE_DETECTED",
      action_taken: "[CH-1] held back",
      is_read: false,
    });
  });
  it("propagates insert errors instead of hiding them", async () => {
    queue("exceptions", { error: { message: "rls" } });
    await expect(createPalletException({ reasonCode: "OTHER", actionTaken: "x" })).rejects.toEqual({ message: "rls" });
  });
});

describe("finalizeAndDispatchTrip", () => {
  const trip = makeTrip({
    stops: [makeStop({ orderId: "o1", rawStoreId: "st1", pallets: [makePallet({ verified: true }), makePallet({ id: "p2" })] })],
  });

  it("dispatches, logs the real verified count and records the chosen exception reason", async () => {
    queue("trips", { error: null });
    queue("exceptions", { error: null });
    queue("loading_logs", { data: logRow, error: null });

    const log = await finalizeAndDispatchTrip({
      trip,
      sealNumber: "SEAL-1",
      hasDiscrepancy: true,
      discrepancyNote: "note",
      discrepancyReason: "MISSING_FROM_STAGING",
      signature: "Loader",
      tempCheck: { chilledTempC: 3, isCompliant: true },
      userId: "u1",
    });

    expect(callsFor("trips", "update")[0].args[0]).toMatchObject({ status: "en_route", security_seal: "SEAL-1", loader_id: "u1" });
    expect(callsFor("pallets", "update")).toHaveLength(0); // never force-verifies pallets
    expect(callsFor("exceptions", "insert")[0].args[0]).toMatchObject({ reason_code: "MISSING_FROM_STAGING", order_id: "o1", store_id: "st1" });
    const payload = callsFor("loading_logs", "insert")[0].args[0] as Record<string, unknown>;
    expect(payload).toMatchObject({ total_pallets: 2, verified_pallets: 1, total_weight_kg: 200, seal_number: "SEAL-1" });
    expect(payload).not.toHaveProperty("shift");
    expect(String(payload.discrepancy_note)).toContain("Reefer Temp Log");
    expect(log.id).toBe("log-1");
  });

  it("throws if the trip update fails and writes nothing else", async () => {
    queue("trips", { error: { message: "denied" } });
    await expect(
      finalizeAndDispatchTrip({ trip, sealNumber: "S-1", hasDiscrepancy: false, discrepancyNote: "", signature: "L" })
    ).rejects.toEqual({ message: "denied" });
    expect(callsFor("loading_logs", "insert")).toHaveLength(0);
  });

  it("throws if the audit log insert fails", async () => {
    queue("trips", { error: null });
    queue("loading_logs", { data: null, error: { message: "log failed" } });
    await expect(
      finalizeAndDispatchTrip({ trip, sealNumber: "S-1", hasDiscrepancy: false, discrepancyNote: "", signature: "L", shift: "Morning" })
    ).rejects.toEqual({ message: "log failed" });
    expect((callsFor("loading_logs", "insert")[0].args[0] as Record<string, unknown>).shift).toBe("Morning");
  });
});

describe("fetchPastLogs", () => {
  it("maps rows", async () => {
    queue("loading_logs", { data: [logRow], error: null });
    const logs = await fetchPastLogs();
    expect(logs[0]).toMatchObject({ id: "log-1", dispatchedAtIso: "2026-10-04T06:00:00Z", verifiedPallets: 1 });
  });
  it("throws on error (no silent empty list)", async () => {
    queue("loading_logs", { data: null, error: { message: "x" } });
    await expect(fetchPastLogs()).rejects.toEqual({ message: "x" });
  });
});
