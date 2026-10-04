import { describe, it, expect } from "vitest";
import { getVehicleImage } from "./vehicleImage";

describe("getVehicleImage", () => {
  it("uses the reefer photo for refrigerated vehicles (even vans)", () => {
    expect(getVehicleImage({ vehicleType: "Hyundai Porter Chilled Van", isRefrigerated: true })).toBe("/truck_reefer.jpg");
  });
  it("uses the van photo for non-refrigerated vans (case-insensitive)", () => {
    expect(getVehicleImage({ vehicleType: "Toyota HiAce Urban Express VAN", isRefrigerated: false })).toBe("/van_express.jpg");
  });
  it("defaults to the heavy truck photo", () => {
    expect(getVehicleImage({ vehicleType: "Isuzu NPR Heavy Freight", isRefrigerated: false })).toBe("/truck_heavy.jpg");
    expect(getVehicleImage({})).toBe("/truck_heavy.jpg");
    expect(getVehicleImage({ vehicleType: null, isRefrigerated: null })).toBe("/truck_heavy.jpg");
  });
});
