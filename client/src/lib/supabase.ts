import { createClient } from "@supabase/supabase-js";

export const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "";
export const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "";
export const isGoogleAuthEnabled = import.meta.env.VITE_ENABLE_GOOGLE_AUTH === "true";

export const isSupabaseEnabled = Boolean(supabaseUrl && supabaseAnonKey);

export const supabase = createClient(supabaseUrl || "https://example.supabase.co", supabaseAnonKey || "anon-key", {
  auth: {
    autoRefreshToken: true,
    detectSessionInUrl: true,
    persistSession: true,
  },
});
