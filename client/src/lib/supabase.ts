import { createClient } from "@supabase/supabase-js";
import { isSupabaseEnabled, supabaseAnonKey, supabaseUrl } from "./supabase-config";

export { isSupabaseEnabled, supabaseAnonKey, supabaseUrl };

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    detectSessionInUrl: true,
    persistSession: true,
  },
});
