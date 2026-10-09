import { describe, expect, it, vi } from "vitest";
import type { SupabaseClient } from "@supabase/supabase-js";
import { requireRole } from "./requireRole";

function mockClient(opts: { user?: { id: string } | null; authError?: unknown; role?: string | null; profileError?: unknown }) {
  const maybeSingle = vi.fn().mockResolvedValue({
    data: opts.role ? { role: opts.role } : null,
    error: opts.profileError ?? null,
  });
  const eq = vi.fn(() => ({ maybeSingle }));
  const select = vi.fn(() => ({ eq }));
  const from = vi.fn(() => ({ select }));
  const client = {
    auth: { getUser: vi.fn().mockResolvedValue({ data: { user: opts.user ?? null }, error: opts.authError ?? null }) },
    from,
  };
  return { client: client as unknown as SupabaseClient, from, eq };
}

describe("requireRole", () => {
  it("returns 401 without a session", async () => {
    const { client } = mockClient({ user: null });
    await expect(requireRole(client)).resolves.toEqual({ ok: false, status: 401, error: "Not signed in" });
  });

  it("returns 401 when the token is invalid", async () => {
    const { client } = mockClient({ user: { id: "u1" }, authError: new Error("bad jwt") });
    expect((await requireRole(client)).ok).toBe(false);
  });

  it("returns 403 when the profile is missing", async () => {
    const { client } = mockClient({ user: { id: "u1" }, role: null });
    await expect(requireRole(client)).resolves.toMatchObject({ ok: false, status: 403 });
  });

  it("returns 403 for a role that is not allowed", async () => {
    const { client } = mockClient({ user: { id: "u1" }, role: "driver" });
    await expect(requireRole(client, ["dispatcher"])).resolves.toMatchObject({ ok: false, status: 403 });
  });

  it("returns the user and role when allowed", async () => {
    const { client, from, eq } = mockClient({ user: { id: "u1" }, role: "dispatcher" });
    const result = await requireRole(client, ["dispatcher"]);
    expect(result).toMatchObject({ ok: true, role: "dispatcher", user: { id: "u1" } });
    expect(from).toHaveBeenCalledWith("profiles");
    expect(eq).toHaveBeenCalledWith("id", "u1");
  });

  it("allows any signed-in role when no roles are given", async () => {
    const { client } = mockClient({ user: { id: "u1" }, role: "loader" });
    expect((await requireRole(client)).ok).toBe(true);
  });
});
