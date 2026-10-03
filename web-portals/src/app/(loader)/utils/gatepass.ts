import QRCode from "qrcode";
import { TripVehicle } from "../types";

export interface GatepassPayload {
  passType: string;
  tripNumber: string;
  plateNumber: string;
  sealNumber: string;
  driver: string;
  bay: string;
  dispatchedAt: string;
  signedBy: string;
  storesCount: number;
  hasDiscrepancy: boolean;
}

/**
 * Builds the canonical digital gatepass security certificate payload.
 */
export function createGatepassPayload(
  trip: TripVehicle,
  sealNumber: string,
  signature: string,
  hasDiscrepancy: boolean
): GatepassPayload {
  return {
    passType: "WAYPOINT_GATEPASS_DISPATCH",
    tripNumber: trip.tripNumber,
    plateNumber: trip.plateNumber,
    sealNumber,
    driver: trip.driverName,
    bay: trip.bay,
    dispatchedAt: new Date().toISOString(),
    signedBy: signature,
    storesCount: trip.stops.length,
    hasDiscrepancy,
  };
}

/**
 * Converts a gatepass certificate payload into a high-density scannable QR Code data URL.
 */
export async function generateGatepassQrDataUrl(payload: GatepassPayload): Promise<string> {
  const jsonString = JSON.stringify(payload);
  return QRCode.toDataURL(jsonString, {
    width: 220,
    margin: 1.5,
    color: {
      dark: "#141517",
      light: "#FFFFFF",
    },
  });
}
