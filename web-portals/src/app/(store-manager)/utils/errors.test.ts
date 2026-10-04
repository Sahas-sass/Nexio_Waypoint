import { describe, expect, it } from "vitest";
import { errorMessage, single, unwrap } from "./errors";

describe("errorMessage", () => {
  it("reads message from objects and Errors", () => {
    expect(errorMessage({ message: "db down" })).toBe("db down");
    expect(errorMessage(new Error("boom"))).toBe("boom");
  });
  it("accepts strings and falls back otherwise", () => {
    expect(errorMessage("plain")).toBe("plain");
    expect(errorMessage(null, "fb")).toBe("fb");
    expect(errorMessage({ message: "" }, "fb")).toBe("fb");
    expect(errorMessage(42)).toMatch(/Something went wrong/);
  });
});

describe("unwrap", () => {
  it("returns data", () => {
    expect(unwrap({ data: [1], error: null })).toEqual([1]);
  });
  it("throws the error message", () => {
    expect(() => unwrap({ data: null, error: { message: "denied" } })).toThrow("denied");
  });
  it("uses empty value or throws for null data", () => {
    expect(unwrap<number[]>({ data: null, error: null }, [])).toEqual([]);
    expect(() => unwrap({ data: null, error: null })).toThrow("No data returned");
  });
});

describe("single", () => {
  it("normalises arrays, objects and nullish", () => {
    expect(single([{ a: 1 }])).toEqual({ a: 1 });
    expect(single([])).toBeNull();
    expect(single({ a: 2 })).toEqual({ a: 2 });
    expect(single(undefined)).toBeNull();
  });
});
