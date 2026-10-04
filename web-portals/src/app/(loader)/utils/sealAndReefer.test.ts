import { describe, it, expect } from "vitest";
import {
  isValidSealNumber,
  checkRefrigerationRequirements,
  evaluateReeferCompliance,
  buildDispatchNotes,
} from "./sealAndReefer";
import { makePallet } from "./testFixtures";

describe("isValidSealNumber", () => {
  it("accepts 4-32 alphanumerics/dashes", () => {
    expect(isValidSealNumber("SL-892301-X")).toBe(true);
    expect(isValidSealNumber("  ABCD ")).toBe(true);
  });
  it("rejects empty, short or invalid characters", () => {
    expect(isValidSealNumber("")).toBe(false);
    expect(isValidSealNumber("AB1")).toBe(false);
    expect(isValidSealNumber("SL 123")).toBe(false);
    expect(isValidSealNumber("x".repeat(33))).toBe(false);
  });
});

describe("checkRefrigerationRequirements", () => {
  it("detects chilled and frozen pallets", () => {
    expect(checkRefrigerationRequirements([makePallet()])).toEqual({ hasChilled: false, hasFrozen: false, isRefrigerated: false });
    expect(checkRefrigerationRequirements([makePallet({ category: "chilled" })])).toEqual({ hasChilled: true, hasFrozen: false, isRefrigerated: true });
    expect(checkRefrigerationRequirements([makePallet({ category: "frozen" })]).isRefrigerated).toBe(true);
  });
});

describe("evaluateReeferCompliance", () => {
  const both = { hasChilled: true, hasFrozen: true };
  it("is compliant when readings are within range", () => {
    expect(evaluateReeferCompliance(both, "3.5", "-18")).toEqual({ chilledTempC: 3.5, frozenTempC: -18, isCompliant: true });
  });
  it("flags out-of-range or missing required readings", () => {
    expect(evaluateReeferCompliance(both, "7", "-18").isCompliant).toBe(false);
    expect(evaluateReeferCompliance(both, "3", "-10").isCompliant).toBe(false);
    expect(evaluateReeferCompliance(both, "", "-18").isCompliant).toBe(false);
    expect(evaluateReeferCompliance(both, "abc", "-18").isCompliant).toBe(false);
  });
  it("ignores zones that are not required", () => {
    expect(evaluateReeferCompliance({ hasChilled: true, hasFrozen: false }, "4", "")).toEqual({
      chilledTempC: 4,
      frozenTempC: undefined,
      isCompliant: true,
    });
  });
});

describe("buildDispatchNotes", () => {
  it("returns the trimmed note when no temp check", () => {
    expect(buildDispatchNotes("  damaged box ")).toBe("damaged box");
    expect(buildDispatchNotes("")).toBe("");
  });
  it("appends the reefer log and flags non-compliance", () => {
    expect(buildDispatchNotes("", { chilledTempC: 3, isCompliant: true })).toBe("Reefer Temp Log: Chill=3°C, Frozen=N/A.");
    expect(buildDispatchNotes("note", { chilledTempC: 9, frozenTempC: -20, isCompliant: false })).toBe(
      "note | Reefer Temp Log: Chill=9°C, Frozen=-20°C (OUT OF RANGE)."
    );
  });
});
