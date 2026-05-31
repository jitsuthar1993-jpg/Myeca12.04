import { PUBLIC_SUPABASE_ANON_KEY, PUBLIC_SUPABASE_URL } from "@shared/supabase-public";

export const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || PUBLIC_SUPABASE_URL;
export const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || PUBLIC_SUPABASE_ANON_KEY;
export const isSupabaseEnabled = Boolean(supabaseUrl && supabaseAnonKey);
