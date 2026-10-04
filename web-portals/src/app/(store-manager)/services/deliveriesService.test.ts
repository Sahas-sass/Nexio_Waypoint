import { beforeEach, describe, expect, it, vi } from "vitest";
import { queryMock } from "./queryMock.testutil";

const { mockSupabase, createSignedUrl } = vi.hoisted(() => {
  const createSignedUrl = vi.fn();
  return { createSignedUrl, mockSupabase: { from: vi.fn(), storage: { from: vi.fn(() => ({ createSignedUrl })) } } };
});
vi.mock("@/lib/supabaseClient", () => ({ supabase: mockSupabase }));

import { EVIDENCE_BUCKET, fetchProofsByOrder, fetchStoreStops, getEvidenceUrl } from "./deliveriesService";

describe("deliveriesService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSupabase.storage.from.mockImplementation(() => ({ createSignedUrl }));
  });

  it("fetches stops and normalises trip/vehicle embeds", async () => {
    const q = queryMock({
      data: [
        { id: "st1", trip: [{ trip_number: "T1", vehicle: [{ registration_number: "TRK-1" }] }] },
        { id: "st2", trip: null },
      ],
      error: null,
    });
    mockSupabase.from.mockReturnValue(q.builder);
    const stops = await fetchStoreStops("s1");
    expect(stops[0].trip).toEqual({ trip_number: "T1", vehicle: { registration_number: "TRK-1" } });
    expect(stops[1].trip).toBeNull();
    expect(q.calls).toContainEqual(["eq", ["store_id", "s1"]]);
  });

  it("maps proofs by order id and skips empty lookups", async () => {
    await expect(fetchProofsByOrder([])).resolves.toEqual(new Map());
    expect(mockSupabase.from).not.toHaveBeenCalled();
    const q = queryMock({ data: [{ order_id: "o1", proof: { id: "p1" } }, { order_id: "o2", proof: [] }], error: null });
    mockSupabase.from.mockReturnValue(q.builder);
    const proofs = await fetchProofsByOrder(["o1", "o2"]);
    expect([...proofs.entries()]).toEqual([["o1", { id: "p1" }]]);
    expect(q.calls).toContainEqual(["in", ["order_id", ["o1", "o2"]]]);
  });

  it("throws query errors", async () => {
    mockSupabase.from.mockReturnValue(queryMock({ data: null, error: { message: "nope" } }).builder);
    await expect(fetchStoreStops("s1")).rejects.toThrow("nope");
  });

  it("resolves evidence urls", async () => {
    await expect(getEvidenceUrl(null)).resolves.toBeNull();
    await expect(getEvidenceUrl("https://cdn/x.jpg")).resolves.toBe("https://cdn/x.jpg");
    createSignedUrl.mockResolvedValueOnce({ data: { signedUrl: "https://signed" }, error: null });
    await expect(getEvidenceUrl("u/stop/photo.jpg")).resolves.toBe("https://signed");
    expect(mockSupabase.storage.from).toHaveBeenCalledWith(EVIDENCE_BUCKET);
    expect(createSignedUrl).toHaveBeenCalledWith("u/stop/photo.jpg", 3600);
    createSignedUrl.mockResolvedValueOnce({ data: null, error: { message: "forbidden" } });
    await expect(getEvidenceUrl("u/stop/photo.jpg")).rejects.toThrow("Could not load delivery evidence");
  });
});
