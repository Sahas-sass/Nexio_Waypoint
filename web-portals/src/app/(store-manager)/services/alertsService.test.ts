import { beforeEach, describe, expect, it, vi } from "vitest";
import { queryMock } from "./queryMock.testutil";

const { mockSupabase } = vi.hoisted(() => ({ mockSupabase: { from: vi.fn() } }));
vi.mock("@/lib/supabaseClient", () => ({ supabase: mockSupabase }));

import { fetchDeferralLogs, fetchStoreExceptions } from "./alertsService";

describe("alertsService", () => {
  beforeEach(() => vi.resetAllMocks());

  it("fetches deferral logs for the store", async () => {
    const q = queryMock({ data: [{ id: "d1" }], error: null });
    mockSupabase.from.mockReturnValue(q.builder);
    await expect(fetchDeferralLogs("s1")).resolves.toEqual([{ id: "d1" }]);
    expect(mockSupabase.from).toHaveBeenCalledWith("deferral_logs");
    expect(q.calls).toContainEqual(["eq", ["store_id", "s1"]]);
  });

  it("fetches exceptions for the store", async () => {
    const q = queryMock({ data: null, error: null });
    mockSupabase.from.mockReturnValue(q.builder);
    await expect(fetchStoreExceptions("s1")).resolves.toEqual([]);
    expect(mockSupabase.from).toHaveBeenCalledWith("exceptions");
  });

  it("throws on errors", async () => {
    mockSupabase.from.mockReturnValue(queryMock({ data: null, error: { message: "denied" } }).builder);
    await expect(fetchDeferralLogs("s1")).rejects.toThrow("denied");
    await expect(fetchStoreExceptions("s1")).rejects.toThrow("denied");
  });
});
