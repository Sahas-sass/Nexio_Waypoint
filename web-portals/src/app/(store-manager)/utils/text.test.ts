import { describe, expect, it } from "vitest";
import { firstName, initials } from "./text";

describe("text utils", () => {
  it("builds initials", () => {
    expect(initials("Waypoint Fresh")).toBe("WF");
    expect(initials("Fresh Store #22 Colombo")).toBe("FS");
    expect(initials("", "X")).toBe("X");
    expect(initials(null)).toBe("ST");
  });
  it("extracts the first name", () => {
    expect(firstName(" Kavindu Perera ")).toBe("Kavindu");
    expect(firstName(null)).toBeNull();
  });
});
