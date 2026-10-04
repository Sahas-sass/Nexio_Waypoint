import { describe, it, expect, vi, afterEach } from "vitest";
import { playScannerSound, triggerHapticFeedback } from "./scannerFeedback";

afterEach(() => vi.unstubAllGlobals());

describe("scannerFeedback", () => {
  it("is a no-op on the server (no window)", () => {
    expect(() => playScannerSound("success")).not.toThrow();
    expect(() => triggerHapticFeedback()).not.toThrow();
  });

  it("vibrates with the given pattern when supported", () => {
    const vibrate = vi.fn();
    vi.stubGlobal("window", {});
    vi.stubGlobal("navigator", { vibrate });
    triggerHapticFeedback([10, 20]);
    expect(vibrate).toHaveBeenCalledWith([10, 20]);
  });

  it("plays a tone through the Web Audio API", () => {
    const param = { setValueAtTime: vi.fn(), exponentialRampToValueAtTime: vi.fn() };
    const osc = { connect: vi.fn(), start: vi.fn(), stop: vi.fn(), type: "", frequency: param };
    const gain = { connect: vi.fn(), gain: param };
    class FakeCtx {
      currentTime = 0;
      destination = {};
      createOscillator = () => osc;
      createGain = () => gain;
    }
    vi.stubGlobal("window", { AudioContext: FakeCtx });
    playScannerSound("error");
    expect(osc.type).toBe("sawtooth");
    expect(osc.start).toHaveBeenCalled();
    playScannerSound("success");
    expect(osc.type).toBe("sine");
  });

  it("swallows audio errors", () => {
    vi.stubGlobal("window", {
      AudioContext: class {
        constructor() {
          throw new Error("blocked");
        }
      },
    });
    expect(() => playScannerSound()).not.toThrow();
  });
});
