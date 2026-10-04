/**
 * Picks a local vehicle photo (served from /public) from the vehicle's attributes.
 * Refrigerated units → reefer truck, vans → express van, everything else → heavy truck.
 */
export function getVehicleImage(vehicle: {
  vehicleType?: string | null;
  isRefrigerated?: boolean | null;
}): string {
  if (vehicle.isRefrigerated) return "/truck_reefer.jpg";
  if ((vehicle.vehicleType ?? "").toLowerCase().includes("van")) return "/van_express.jpg";
  return "/truck_heavy.jpg";
}
