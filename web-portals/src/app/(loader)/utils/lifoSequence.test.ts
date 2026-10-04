import { describe, it, expect } from "vitest";
import { findActiveLIFOStop, checkLIFOSequenceViolation } from "./lifoSequence";
import { makePallet, makeStop } from "./testFixtures";

const deep = makeStop({ stopId: "s2", stopNumber: 2, loadSequence: 1, storeName: "Last Drop", pallets: [makePallet({ id: "a" })] });
const door = makeStop({ stopId: "s1", stopNumber: 1, loadSequence: 2, storeName: "First Drop", pallets: [makePallet({ id: "b" })] });

describe("findActiveLIFOStop", () => {
  it("returns the first stop (by load order) with unverified pallets", () => {
    expect(findActiveLIFOStop([deep, door])?.stopId).toBe("s2");
  });
  it("skips fully verified stops and returns undefined when all done", () => {
    const doneDeep = { ...deep, pallets: [makePallet({ id: "a", verified: true })] };
    expect(findActiveLIFOStop([doneDeep, door])?.stopId).toBe("s1");
    expect(findActiveLIFOStop([doneDeep, { ...door, pallets: [] }])).toBeUndefined();
  });
});

describe("checkLIFOSequenceViolation", () => {
  it("flags loading a later-sequence pallet before the active stop is done", () => {
    expect(checkLIFOSequenceViolation(door.pallets[0], 1, 2, deep)).toEqual({
      pendingPalletId: "b",
      targetStopNumber: 1,
      activeStopNumber: 2,
      activeStopName: "Last Drop",
    });
  });
  it("allows in-sequence loads, already-verified pallets and no active stop", () => {
    expect(checkLIFOSequenceViolation(deep.pallets[0], 2, 1, deep)).toBeNull();
    expect(checkLIFOSequenceViolation(makePallet({ verified: true }), 1, 2, deep)).toBeNull();
    expect(checkLIFOSequenceViolation(door.pallets[0], 1, 2, undefined)).toBeNull();
  });
});
