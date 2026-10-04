import { describe, expect, it } from "vitest";
import { orderTone, outcomeTone, receiptTone, stopTone } from "./tones";

describe("tones", () => {
  it("maps statuses to tones with a neutral fallback", () => {
    expect(orderTone("deferred")).toBe("amber");
    expect(orderTone("?")).toBe("neutral");
    expect(receiptTone("rejected")).toBe("red");
    expect(receiptTone("?")).toBe("neutral");
    expect(stopTone("FAILED")).toBe("red");
    expect(stopTone("?")).toBe("neutral");
    expect(outcomeTone("delivered")).toBe("green");
    expect(outcomeTone("partial")).toBe("amber");
    expect(outcomeTone("failed")).toBe("red");
  });
});
