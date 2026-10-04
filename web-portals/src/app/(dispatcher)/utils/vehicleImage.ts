/** Picks a local vehicle photo from the vehicle's attributes. */
export function getVehicleImage(vehicle: { vehicleType?: string | null; isRefrigerated?: boolean | null }): string {
  if (/\bvan\b/i.test(vehicle.vehicleType ?? "")) return "/van_express.jpg";
  if (vehicle.isRefrigerated) return "/truck_reefer.jpg";
  return "/truck_heavy.jpg";
}
