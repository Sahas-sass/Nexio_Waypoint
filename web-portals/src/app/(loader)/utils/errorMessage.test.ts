import { describe, it, expect } from "vitest";
import { errorMessage } from "./errorMessage";

describe("errorMessage", () => {
  it("reads Error and Supabase-style error objects", () => {
    expect(errorMessage(new Error("boom"), "x")).toBe("boom");
    expect(errorMessage({ message: "permission denied", code: "42501" }, "x")).toBe("permission denied");
  });
  it("accepts non-empty strings", () => {
    expect(errorMessage("oops", "x")).toBe("oops");
  });
  it("falls back for empty or unknown values", () => {
    expect(errorMessage(undefined, "fallback")).toBe("fallback");
    expect(errorMessage({ message: "" }, "fallback")).toBe("fallback");
    expect(errorMessage(42, "fallback")).toBe("fallback");
  });
});
