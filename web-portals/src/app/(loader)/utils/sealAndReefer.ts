import { PalletItem, ReeferTempCheck } from "../types";

/** Cold-chain limits (°C) a reefer must meet before dispatch. */
export const CHILLED_RANGE_C = { min: 0, max: 5 } as const;
export const FROZEN_MAX_C = -15;

/**
 * A physical tamper-evident seal tag: 4–32 letters, digits or dashes.
 */
export function isValidSealNumber(seal: string): boolean {
  return /^[A-Za-z0-9-]{4,32}$/.test(seal.trim());
}

/**
 * Inspects a list of pallets to determine cold-chain compartment requirements.
 */
export function checkRefrigerationRequirements(pallets: PalletItem[]): {
  hasChilled: boolean;
  hasFrozen: boolean;
  isRefrigerated: boolean;
} {
  const hasChilled = pallets.some((p) => p.category === "chilled");
  const hasFrozen = pallets.some((p) => p.category === "frozen");
  return { hasChilled, hasFrozen, isRefrigerated: hasChilled || hasFrozen };
}

/**
 * Builds a reefer temperature check from the loader's raw inputs.
 * Required zones with a missing/non-numeric reading are non-compliant.
 */
export function evaluateReeferCompliance(
  required: { hasChilled: boolean; hasFrozen: boolean },
  chilledInput: string,
  frozenInput: string
): ReeferTempCheck {
  const parse = (v: string) => (v.trim() === "" ? undefined : Number(v));
  const chilledTempC = required.hasChilled ? parse(chilledInput) : undefined;
  const frozenTempC = required.hasFrozen ? parse(frozenInput) : undefined;

  const chilledOk =
    !required.hasChilled ||
    (chilledTempC !== undefined &&
      Number.isFinite(chilledTempC) &&
      chilledTempC >= CHILLED_RANGE_C.min &&
      chilledTempC <= CHILLED_RANGE_C.max);
  const frozenOk =
    !required.hasFrozen ||
    (frozenTempC !== undefined && Number.isFinite(frozenTempC) && frozenTempC <= FROZEN_MAX_C);

  return { chilledTempC, frozenTempC, isCompliant: chilledOk && frozenOk };
}

/**
 * Combines the discrepancy note with the reefer temperature log for the audit trail.
 */
export function buildDispatchNotes(discrepancyNote: string, tempCheck?: ReeferTempCheck): string {
  const note = discrepancyNote.trim();
  if (!tempCheck) return note;
  const fmt = (v?: number) => (v === undefined ? "N/A" : `${v}°C`);
  const tempSummary = `Reefer Temp Log: Chill=${fmt(tempCheck.chilledTempC)}, Frozen=${fmt(tempCheck.frozenTempC)}${
    tempCheck.isCompliant ? "" : " (OUT OF RANGE)"
  }.`;
  return note ? `${note} | ${tempSummary}` : tempSummary;
}
