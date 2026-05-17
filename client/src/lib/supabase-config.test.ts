import { afterEach, describe, expect, it, vi } from "vitest";
import { PUBLIC_SUPABASE_URL } from "@shared/supabase-public";

describe("Supabase browser config", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.resetModules();
  });

  it("keeps browser auth enabled when Vite public env vars are missing", async () => {
    vi.stubEnv("VITE_SUPABASE_URL", "");
    vi.stubEnv("VITE_SUPABASE_ANON_KEY", "");
    vi.resetModules();

    const config = await import("@/lib/supabase");

    expect(config.supabaseUrl).toBe(PUBLIC_SUPABASE_URL);
    expect(config.supabaseAnonKey).toMatch(/^eyJ/);
    expect(config.isSupabaseEnabled).toBe(true);
  });
});
