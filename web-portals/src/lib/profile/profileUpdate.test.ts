import { describe, expect, it } from "vitest";
import { sanitizeProfileUpdate } from "./profileUpdate";

describe("sanitizeProfileUpdate", () => {
  it("maps editable fields to columns and trims text", () => {
    expect(sanitizeProfileUpdate({ fullName: "  Kasun Perera ", phone: "+94 77 123 4567", assignedBay: "Bay 2" })).toEqual({
      ok: true,
      payload: { full_name: "Kasun Perera", phone: "+94 77 123 4567", assigned_bay: "Bay 2" },
    });
  });

  it("ignores the legacy userId key (the caller is always the target)", () => {
    expect(sanitizeProfileUpdate({ userId: "someone-else", shift: "Night" })).toEqual({
      ok: true,
      payload: { shift: "Night" },
    });
  });

  it.each(["role", "storeId", "store_id", "id", "permissions", "isVerified", "status", "employeeId"])(
    "rejects privileged field %s",
    (field) => {
      const result = sanitizeProfileUpdate({ fullName: "A", [field]: "x" });
      expect(result).toEqual({ ok: false, error: `Field "${field}" cannot be changed` });
    }
  );

  it("rejects invalid input", () => {
    expect(sanitizeProfileUpdate(null).ok).toBe(false);
    expect(sanitizeProfileUpdate([]).ok).toBe(false);
    expect(sanitizeProfileUpdate({}).ok).toBe(false);
    expect(sanitizeProfileUpdate({ fullName: "   " }).ok).toBe(false);
    expect(sanitizeProfileUpdate({ fullName: 42 }).ok).toBe(false);
    expect(sanitizeProfileUpdate({ fullName: "x".repeat(101) }).ok).toBe(false);
    expect(sanitizeProfileUpdate({ phone: "call me" }).ok).toBe(false);
  });

  it("allows clearing optional fields", () => {
    expect(sanitizeProfileUpdate({ station: null, outlet: "" })).toEqual({
      ok: true,
      payload: { station: null, outlet: null },
    });
  });

  it("validates activities", () => {
    const activity = { title: "Dispatched", meta: "TRIP 1", type: "truck", time: "2026-10-04T08:00:00Z" };
    expect(sanitizeProfileUpdate({ activities: [activity] })).toEqual({ ok: true, payload: { activities: [activity] } });
    expect(sanitizeProfileUpdate({ activities: Array(11).fill(activity) }).ok).toBe(false);
    expect(sanitizeProfileUpdate({ activities: [{ title: 1 }] }).ok).toBe(false);
    expect(sanitizeProfileUpdate({ activities: "x" }).ok).toBe(false);
  });
});
