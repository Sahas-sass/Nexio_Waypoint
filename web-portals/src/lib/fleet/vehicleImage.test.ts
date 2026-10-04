import { describe, expect, it } from "vitest";
import { getVehicleImage, VEHICLE_IMAGES } from "./vehicleImage";

describe("getVehicleImage", () => {
  it("uses the van image for any van type", () => {
    expect(getVehicleImage({ vehicle_type: "Hyundai Porter Chilled Van", is_refrigerated: true })).toBe(VEHICLE_IMAGES.van);
    expect(getVehicleImage({ vehicle_type: "VAN" })).toBe(VEHICLE_IMAGES.van);
  });

  it("does not treat words containing 'van' as vans", () => {
    expect(getVehicleImage({ vehicle_type: "Advanced Hauler" })).toBe(VEHICLE_IMAGES.heavy);
  });

  it("uses the reefer image for refrigerated trucks", () => {
    expect(getVehicleImage({ vehicle_type: "Hino 500 Dual-Zone Reefer", is_refrigerated: true })).toBe(VEHICLE_IMAGES.reefer);
  });

  it("falls back to the heavy truck", () => {
    expect(getVehicleImage({ vehicle_type: "UD Quester Heavy Hauler", is_refrigerated: false })).toBe(VEHICLE_IMAGES.heavy);
    expect(getVehicleImage(null)).toBe(VEHICLE_IMAGES.heavy);
  });
});
