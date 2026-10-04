import { beforeEach, describe, expect, it, vi } from "vitest";

const m = vi.hoisted(() => ({
  fetchStoreOrders: vi.fn(), fetchStoreReceipts: vi.fn(), fetchDeferralLogs: vi.fn(),
  fetchStoreExceptions: vi.fn(), fetchStoreStops: vi.fn(), fetchProofsByOrder: vi.fn(),
}));
vi.mock("@/lib/supabaseClient", () => ({ supabase: {} }));
vi.mock("./ordersService", () => ({ fetchStoreOrders: m.fetchStoreOrders }));
vi.mock("./receiptsService", () => ({ fetchStoreReceipts: m.fetchStoreReceipts }));
vi.mock("./alertsService", () => ({ fetchDeferralLogs: m.fetchDeferralLogs, fetchStoreExceptions: m.fetchStoreExceptions }));
vi.mock("./deliveriesService", () => ({ fetchStoreStops: m.fetchStoreStops, fetchProofsByOrder: m.fetchProofsByOrder }));

import { loadAlertsData, loadOverviewData, loadPendingReceipts } from "./pageLoaders";

const orders = [{ id: "o1", status: "delivered" }, { id: "o2", status: "delivered" }, { id: "o3", status: "pending" }];

describe("pageLoaders", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    m.fetchStoreOrders.mockResolvedValue(orders);
    m.fetchStoreReceipts.mockResolvedValue([{ order_id: "o1" }]);
    m.fetchDeferralLogs.mockResolvedValue([{ id: "d" }]);
    m.fetchStoreExceptions.mockResolvedValue([{ id: "e" }]);
    m.fetchStoreStops.mockResolvedValue([{ id: "st" }]);
  });

  it("loads overview data for the store", async () => {
    await expect(loadOverviewData("s1")).resolves.toEqual({
      orders, receipts: [{ order_id: "o1" }], deferrals: [{ id: "d" }], stops: [{ id: "st" }],
    });
    expect(m.fetchStoreStops).toHaveBeenCalledWith("s1");
  });

  it("loads unconfirmed deliveries with their proof", async () => {
    m.fetchProofsByOrder.mockResolvedValue(new Map([["o2", { id: "p2" }]]));
    await expect(loadPendingReceipts("s1")).resolves.toEqual([{ order: orders[1], proof: { id: "p2" } }]);
    expect(m.fetchProofsByOrder).toHaveBeenCalledWith(["o2"]);
  });

  it("returns null proof when none was captured", async () => {
    m.fetchProofsByOrder.mockResolvedValue(new Map());
    await expect(loadPendingReceipts("s1")).resolves.toEqual([{ order: orders[1], proof: null }]);
  });

  it("loads alerts data and propagates failures", async () => {
    await expect(loadAlertsData("s1")).resolves.toEqual({ deferrals: [{ id: "d" }], orders, exceptions: [{ id: "e" }] });
    m.fetchStoreExceptions.mockRejectedValue(new Error("down"));
    await expect(loadAlertsData("s1")).rejects.toThrow("down");
  });
});
