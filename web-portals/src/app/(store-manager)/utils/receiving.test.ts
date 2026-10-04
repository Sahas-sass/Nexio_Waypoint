import { describe, expect, it } from "vitest";
import { isStoragePath, issueLabel, validateReceiptForm } from "./receiving";

describe("validateReceiptForm", () => {
  const v = (itemsReceived: string, issueType = "", issueNote = "") => ({ itemsReceived, issueType, issueNote });
  it("accepts a full receipt", () => {
    expect(validateReceiptForm("o1", 10, v("10"))).toEqual({ error: null, input: { orderId: "o1", itemsReceived: 10, issueType: null, issueNote: null } });
  });
  it("accepts a partial receipt with an issue", () => {
    expect(validateReceiptForm("o1", 10, v("8", "damaged", " torn "))).toEqual({
      error: null, input: { orderId: "o1", itemsReceived: 8, issueType: "damaged", issueNote: "torn" },
    });
  });
  it("rejects invalid counts and missing issue type", () => {
    expect(validateReceiptForm("o1", 10, v("")).error).toMatch(/whole number/);
    expect(validateReceiptForm("o1", 10, v("-1")).error).toMatch(/whole number/);
    expect(validateReceiptForm("o1", 10, v("1.5")).error).toMatch(/whole number/);
    expect(validateReceiptForm("o1", 10, v("11")).error).toMatch(/cannot exceed the 10/);
    expect(validateReceiptForm("o1", 10, v("5")).error).toMatch(/Select an issue type/);
    expect(validateReceiptForm("o1", 10, v("5", "bogus")).error).toMatch(/valid issue type/);
    expect(validateReceiptForm("o1", 10, v("10", "", "x".repeat(501))).error).toMatch(/cannot exceed 500/);
  });
  it("allows any count when expected is unknown", () => {
    expect(validateReceiptForm("o1", null, v("99")).input?.itemsReceived).toBe(99);
  });
});

describe("issueLabel / isStoragePath", () => {
  it("labels issues", () => {
    expect(issueLabel("wrong_item")).toBe("Wrong item");
    expect(issueLabel(null)).toBe("None");
    expect(issueLabel("x")).toBe("x");
  });
  it("detects storage paths", () => {
    expect(isStoragePath("uid/stop/photo.jpg")).toBe(true);
    expect(isStoragePath("https://x/y.jpg")).toBe(false);
    expect(isStoragePath("data:image/png;base64,AA")).toBe(false);
    expect(isStoragePath(null)).toBe(false);
  });
});
