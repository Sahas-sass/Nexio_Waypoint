import { PalletItem } from "../types";

/**
 * Auto-generates a standardized tamper-evident security seal tag number.
 * Format: SL-<6-digit-random>-X (e.g., SL-892301-X)
 */
export function generateSecuritySealTag(): string {
  const randNum = Math.floor(100000 + Math.random() * 900000);
  return `SL-${randNum}-X`;
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
  const isRefrigerated = hasChilled || hasFrozen;

  return {
    hasChilled,
    hasFrozen,
    isRefrigerated,
  };
}
