import { describe, expect, it } from "vitest";
import { getSupabasePublicEnv, getSupabaseServiceKey } from "./env";

describe("getSupabasePublicEnv", () => {
  it("returns url and anon key", () => {
    expect(
      getSupabasePublicEnv({ NEXT_PUBLIC_SUPABASE_URL: "https://x.supabase.co", NEXT_PUBLIC_SUPABASE_ANON_KEY: "anon" })
    ).toEqual({ url: "https://x.supabase.co", anonKey: "anon" });
  });

  it("throws when missing", () => {
    expect(() => getSupabasePublicEnv({ NEXT_PUBLIC_SUPABASE_URL: "https://x.supabase.co" })).toThrow();
  });
});

describe("getSupabaseServiceKey", () => {
  it("accepts either variable name", () => {
    expect(getSupabaseServiceKey({ SUPABASE_SERVICE_KEY: "a" })).toBe("a");
    expect(getSupabaseServiceKey({ SUPABASE_SERVICE_ROLE_KEY: "b" })).toBe("b");
  });

  it("throws when missing", () => {
    expect(() => getSupabaseServiceKey({})).toThrow();
  });
});
