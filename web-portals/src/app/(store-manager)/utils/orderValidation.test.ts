import { describe, expect, it } from "vitest";
import { emptyOrderForm, validateOrderForm, type OrderFormValues } from "./orderValidation";

const now = new Date("2026-10-04T04:00:00Z"); // 09:30 Colombo -> earliest 2026-10-05
const valid: OrderFormValues = {
  targetDate: "2026-10-05", temp: "chilled", weightKg: "120.5", volumeM3: "2", itemCount: "30", priority: "High", notes: "  rear dock  ",
};

describe("emptyOrderForm", () => {
  it("defaults to the earliest allowed date", () => {
    expect(emptyOrderForm(now)).toMatchObject({ targetDate: "2026-10-05", temp: "ambient", priority: "Standard" });
  });
});

describe("validateOrderForm", () => {
  it("returns RPC input for valid values", () => {
    expect(validateOrderForm(valid, now)).toEqual({
      errors: {},
      input: { targetDate: "2026-10-05", temp: "chilled", weightKg: 120.5, volumeM3: 2, itemCount: 30, priority: "High", notes: "rear dock" },
    });
  });
  it("maps blank notes to null", () => {
    expect(validateOrderForm({ ...valid, notes: " " }, now).input?.notes).toBeNull();
  });
  it("enforces the cutoff rule", () => {
    const r = validateOrderForm({ ...valid, targetDate: "2026-10-04" }, now);
    expect(r.input).toBeNull();
    expect(r.errors.targetDate).toMatch(/earliest delivery date is 2026-10-05/);
  });
  it("rejects malformed values", () => {
    const r = validateOrderForm(
      { targetDate: "", temp: "frozen", weightKg: "", volumeM3: "-1", itemCount: "2.5", priority: "Urgent", notes: "x".repeat(501) },
      now,
    );
    expect(Object.keys(r.errors).sort()).toEqual(["itemCount", "notes", "priority", "targetDate", "temp", "volumeM3", "weightKg"]);
    expect(r.errors.weightKg).toBe("Weight is required");
    expect(r.errors.itemCount).toBe("Item count must be a whole number");
  });
  it("rejects values above limits and non-numbers", () => {
    const r = validateOrderForm({ ...valid, weightKg: "999999", volumeM3: "abc" }, now);
    expect(r.errors.weightKg).toMatch(/cannot exceed/);
    expect(r.errors.volumeM3).toMatch(/greater than 0/);
  });
});
