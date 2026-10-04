import { describe, expect, it } from "vitest";
import { getVehicleImage } from "./vehicleImage";

describe("getVehicleImage", () => {
  it("uses the van photo for vans, even refrigerated ones", () => {
    expect(getVehicleImage({ vehicleType: "Toyota HiAce Van", isRefrigerated: false })).toBe("/van_express.jpg");
    expect(getVehicleImage({ vehicleType: "Hyundai Porter Chilled Van", isRefrigerated: true })).toBe("/van_express.jpg");
  });
  it("uses the reefer photo for refrigerated trucks", () => {
    expect(getVehicleImage({ vehicleType: "Isuzu Forward Chilled Liner", isRefrigerated: true })).toBe("/truck_reefer.jpg");
  });
  it("defaults to the heavy truck photo", () => {
    expect(getVehicleImage({ vehicleType: "Isuzu NPR Heavy Freight", isRefrigerated: false })).toBe("/truck_heavy.jpg");
    expect(getVehicleImage({})).toBe("/truck_heavy.jpg");
  });
});
