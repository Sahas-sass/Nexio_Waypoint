export const VEHICLE_IMAGES = {
  van: "/van_express.jpg",
  reefer: "/truck_reefer.jpg",
  heavy: "/truck_heavy.jpg",
} as const;

/** Picks the illustration in /public that matches a vehicle's attributes. */
export function getVehicleImage(
  vehicle: { vehicle_type?: string | null; is_refrigerated?: boolean | null } | null | undefined
): string {
  if (/\bvan\b/i.test(vehicle?.vehicle_type ?? "")) return VEHICLE_IMAGES.van;
  if (vehicle?.is_refrigerated) return VEHICLE_IMAGES.reefer;
  return VEHICLE_IMAGES.heavy;
}
