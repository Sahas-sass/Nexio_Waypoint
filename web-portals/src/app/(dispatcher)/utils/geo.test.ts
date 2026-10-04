import { describe, expect, it } from "vitest";
import { haversineKm } from "./geo";

describe("haversineKm", () => {
  it("is zero for identical points", () => {
    expect(haversineKm(6.9, 79.8, 6.9, 79.8)).toBe(0);
  });
  it("matches a known distance (Colombo depot → Nugegoda ≈ 9 km)", () => {
    const km = haversineKm(6.953, 79.882, 6.8724, 79.8895);
    expect(km).toBeGreaterThan(8.5);
    expect(km).toBeLessThan(9.5);
  });
});
