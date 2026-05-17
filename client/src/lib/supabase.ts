import { createClient } from "@supabase/supabase-js";
import { PUBLIC_SUPABASE_ANON_KEY, PUBLIC_SUPABASE_URL } from "@shared/supabase-public";

export const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || PUBLIC_SUPABASE_URL;
export const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || PUBLIC_SUPABASE_ANON_KEY;
export const isGoogleAuthEnabled = import.meta.env.VITE_ENABLE_GOOGLE_AUTH === "true";

export const isSupabaseEnabled = Boolean(supabaseUrl && supabaseAnonKey);

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    detectSessionInUrl: true,
    persistSession: true,
  },
});
