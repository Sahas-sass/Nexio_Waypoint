import { describe, expect, it } from "vitest";
import { asyncReducer, initialAsyncState, type AsyncState } from "./asyncState";

describe("asyncReducer", () => {
  it("starts loading", () => {
    expect(initialAsyncState).toEqual({ data: null, loading: true, error: null });
  });
  it("handles success, error and reload while keeping data", () => {
    let s: AsyncState<number> = initialAsyncState;
    s = asyncReducer(s, { type: "success", data: 1 });
    expect(s).toEqual({ data: 1, loading: false, error: null });
    s = asyncReducer(s, { type: "start" });
    expect(s).toEqual({ data: 1, loading: true, error: null });
    s = asyncReducer(s, { type: "error", error: "boom" });
    expect(s).toEqual({ data: 1, loading: false, error: "boom" });
  });
});
