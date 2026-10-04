import { beforeEach, describe, expect, it, vi } from "vitest";
import { queryMock } from "./queryMock.testutil";

const { mockSupabase } = vi.hoisted(() => ({ mockSupabase: { from: vi.fn(), rpc: vi.fn() } }));
vi.mock("@/lib/supabaseClient", () => ({ supabase: mockSupabase }));

import { confirmReceipt, fetchStoreReceipts } from "./receiptsService";

describe("receiptsService", () => {
  beforeEach(() => vi.resetAllMocks());

  it("fetches receipts and normalises the embedded order", async () => {
    const q = queryMock({ data: [{ id: "r1", order: [{ order_number: "ORD-1" }] }, { id: "r2", order: null }], error: null });
    mockSupabase.from.mockReturnValue(q.builder);
    await expect(fetchStoreReceipts("s1")).resolves.toEqual([
      { id: "r1", order: { order_number: "ORD-1" } },
      { id: "r2", order: null },
    ]);
    expect(mockSupabase.from).toHaveBeenCalledWith("store_receipts");
    expect(q.calls).toContainEqual(["eq", ["store_id", "s1"]]);
  });

  it("returns [] when no rows and throws on error", async () => {
    mockSupabase.from.mockReturnValueOnce(queryMock({ data: null, error: null }).builder);
    await expect(fetchStoreReceipts("s1")).resolves.toEqual([]);
    mockSupabase.from.mockReturnValueOnce(queryMock({ data: null, error: { message: "x" } }).builder);
    await expect(fetchStoreReceipts("s1")).rejects.toThrow("x");
  });

  it("confirms via RPC", async () => {
    mockSupabase.rpc.mockResolvedValue({ data: { id: "r9", status: "partial" }, error: null });
    await expect(confirmReceipt({ orderId: "o1", itemsReceived: 4, issueType: "damaged", issueNote: "wet" })).resolves.toEqual({ id: "r9", status: "partial" });
    expect(mockSupabase.rpc).toHaveBeenCalledWith("confirm_order_receipt", { p_order_id: "o1", p_items_received: 4, p_issue_type: "damaged", p_issue_note: "wet" });
  });

  it("surfaces RPC errors", async () => {
    mockSupabase.rpc.mockResolvedValue({ data: null, error: { message: "Order has not been delivered yet" } });
    await expect(confirmReceipt({ orderId: "o1", itemsReceived: 1, issueType: null, issueNote: null })).rejects.toThrow("not been delivered");
  });
});
