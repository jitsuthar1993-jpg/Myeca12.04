import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const PUBLIC_SUPABASE_URL = "https://vedumlohmacaghuebduy.supabase.co";
const PUBLIC_SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsImtpZCI6IkJlYkRpZVBqOThLRmdHdlMiLCJ0eXAiOiJKV1QifQ.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZlZHVtbG9obWFjYWdodWViZHV5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUzMjY4OTIsImV4cCI6MjA4MDkwMjg5Mn0.3U8f3U3nS3OPAZLL4hFQme0AJYGyb0fdnULvxzFNs18";

let supabaseAdminClient: SupabaseClient | null = null;
let supabaseAuthClient: SupabaseClient | null = null;

export function getSupabaseUrl() {
  return process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || PUBLIC_SUPABASE_URL;
}

export function getSupabaseAnonKey() {
  return process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || PUBLIC_SUPABASE_ANON_KEY;
}

export function getSupabaseServiceRoleKey() {
  return process.env.SUPABASE_SERVICE_ROLE_KEY;
}

export function getSupabaseAuthClient() {
  if (!supabaseAuthClient) {
    const url = getSupabaseUrl();
    const anonKey = getSupabaseAnonKey();

    if (!url || !anonKey) {
      throw new Error("SUPABASE_URL and SUPABASE_ANON_KEY are required for Supabase Auth");
    }

    supabaseAuthClient = createClient(url, anonKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });
  }

  return supabaseAuthClient;
}

export function getSupabaseAdminClient() {
  if (!supabaseAdminClient) {
    const url = getSupabaseUrl();
    const serviceRoleKey = getSupabaseServiceRoleKey();

    if (!url || !serviceRoleKey) {
      throw new Error("SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required for Supabase admin operations");
    }

    supabaseAdminClient = createClient(url, serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });
  }

  return supabaseAdminClient;
}
