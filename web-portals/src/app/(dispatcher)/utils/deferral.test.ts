import { describe, expect, it } from "vitest";
import { deferralSummary, nextRunOptions } from "./deferral";
import type { DeferredOrder } from "./allocation";

describe("nextRunOptions", () => {
  it("lists the next three days after the planning date", () => {
    const opts = nextRunOptions("2026-10-05");
    expect(opts).toHaveLength(3);
    expect(opts[0]).toMatch(/Tue.*6.*Oct - Morning run/);
    expect(opts[2]).toMatch(/Thu.*8.*Oct/);
  });
  it("returns nothing for an invalid date", () => {
    expect(nextRunOptions("nope")).toEqual([]);
  });
});

describe("deferralSummary", () => {
  it("totals orders, distinct stores, volume and weight", () => {
    const mk = (id: string, storeId: string, v: number, w: number) =>
      ({ order: { id, storeId, totalVolumeM3: v, totalWeightKg: w }, reason: "Fleet Capacity" }) as unknown as DeferredOrder;
    expect(deferralSummary([mk("a", "s1", 1.5, 100), mk("b", "s1", 2, 50), mk("c", "s2", 0.5, 10)])).toEqual({
      orders: 3,
      stores: 2,
      volumeM3: 4,
      weightKg: 160,
    });
    expect(deferralSummary([])).toEqual({ orders: 0, stores: 0, volumeM3: 0, weightKg: 0 });
  });
});
