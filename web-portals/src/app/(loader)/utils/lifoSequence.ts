import { StopGroup, PalletItem } from "../types";

export interface LIFOSequenceWarning {
  pendingPalletId: string;
  targetStopNumber: number;
  activeStopNumber: number;
  activeStopName: string;
}

/**
 * Finds the currently active stop in reverse LIFO sequence.
 * In reverse-loading, stops with the lowest loadSequence that still have
 * unverified pallets must be completed first.
 */
export function findActiveLIFOStop(stops: StopGroup[]): StopGroup | undefined {
  return stops.find((s) => s.pallets.some((p) => !p.verified));
}

/**
 * Validates whether loading the specified pallet violates the reverse LIFO sequence.
 * Returns a warning descriptor if out-of-sequence, or null if loading is valid.
 */
export function checkLIFOSequenceViolation(
  pallet: PalletItem,
  stopNumber: number,
  loadSequence: number,
  activeStop: StopGroup | undefined
): LIFOSequenceWarning | null {
  if (!pallet.verified && activeStop && activeStop.loadSequence < loadSequence) {
    return {
      pendingPalletId: pallet.id,
      targetStopNumber: stopNumber,
      activeStopNumber: activeStop.stopNumber,
      activeStopName: activeStop.storeName,
    };
  }
  return null;
}
