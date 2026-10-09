import { beforeEach, describe, expect, it, vi } from "vitest";
import { queryMock } from "./queryMock.testutil";

const { mockSupabase } = vi.hoisted(() => ({ mockSupabase: { auth: { getUser: vi.fn() }, from: vi.fn() } }));
vi.mock("@/lib/supabaseClient", () => ({ supabase: mockSupabase }));

import { fetchStoreContext } from "./storeService";

const store = { id: "s1", name: "Store" };

describe("fetchStoreContext", () => {
  beforeEach(() => vi.resetAllMocks());

  it("returns profile and store", async () => {
    mockSupabase.auth.getUser.mockResolvedValue({ data: { user: { id: "u1" } }, error: null });
    const profile = queryMock({ data: { full_name: "K", role: "store_manager", store_id: "s1" }, error: null });
    const st = queryMock({ data: store, error: null });
    mockSupabase.from.mockImplementation((t: string) => (t === "profiles" ? profile.builder : st.builder));
    await expect(fetchStoreContext()).resolves.toEqual({ userId: "u1", fullName: "K", store });
    expect(profile.calls).toContainEqual(["eq", ["id", "u1"]]);
    expect(st.calls).toContainEqual(["eq", ["id", "s1"]]);
  });

  it("rejects when signed out", async () => {
    mockSupabase.auth.getUser.mockResolvedValue({ data: { user: null }, error: null });
    await expect(fetchStoreContext()).rejects.toThrow("not signed in");
  });

  it("rejects non store managers, missing store and missing store row", async () => {
    mockSupabase.auth.getUser.mockResolvedValue({ data: { user: { id: "u1" } }, error: null });
    mockSupabase.from.mockReturnValueOnce(queryMock({ data: { role: "driver", store_id: "s1" }, error: null }).builder);
    await expect(fetchStoreContext()).rejects.toThrow("only available to store managers");
    mockSupabase.from.mockReturnValueOnce(queryMock({ data: { role: "store_manager", store_id: null }, error: null }).builder);
    await expect(fetchStoreContext()).rejects.toThrow("No store is assigned");
    mockSupabase.from
      .mockReturnValueOnce(queryMock({ data: { role: "store_manager", store_id: "s1" }, error: null }).builder)
      .mockReturnValueOnce(queryMock({ data: null, error: null }).builder);
    await expect(fetchStoreContext()).rejects.toThrow("could not be found");
  });

  it("surfaces query errors", async () => {
    mockSupabase.auth.getUser.mockResolvedValue({ data: { user: { id: "u1" } }, error: null });
    mockSupabase.from.mockReturnValueOnce(queryMock({ data: null, error: { message: "rls" } }).builder);
    await expect(fetchStoreContext()).rejects.toThrow("rls");
  });
});
