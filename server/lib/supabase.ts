import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const PUBLIC_SUPABASE_URL = "https://vedumlohmacaghuebduy.supabase.co";
const PUBLIC_SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZlZHVtbG9obWFjYWdodWViZHV5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg0MTI1NjksImV4cCI6MjA5Mzk4ODU2OX0.4bwcKGKY4xA4faPL9-PXzEy63qFZo7pj3elxYkVMd40";

let supabaseAdminClient: SupabaseClient | null = null;
let supabaseAuthClient: SupabaseClient | null = null;
let publicSupabaseAuthClient: SupabaseClient | null = null;

function isProduction() {
  return process.env.NODE_ENV === "production";
}

export function getSupabaseUrl() {
  const configured = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  if (configured) return configured;
  if (isProduction()) {
    throw new Error("SUPABASE_URL or VITE_SUPABASE_URL is required in production");
  }
  return PUBLIC_SUPABASE_URL;
}

export function getSupabaseAnonKey() {
  const configured = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;
  if (configured) return configured;
  if (isProduction()) {
    throw new Error("SUPABASE_ANON_KEY or VITE_SUPABASE_ANON_KEY is required in production");
  }
  return PUBLIC_SUPABASE_ANON_KEY;
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

export function getPublicSupabaseAuthClient() {
  if (!publicSupabaseAuthClient) {
    publicSupabaseAuthClient = createClient(getSupabaseUrl(), getSupabaseAnonKey(), {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });
  }

  return publicSupabaseAuthClient;
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
