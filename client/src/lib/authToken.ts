import {
  TEMPORARY_TEST_AUTH_TOKEN_KEY,
  TEMPORARY_TEST_AUTH_TOKEN_PREFIX,
} from "@/lib/temporary-test-users";
import { allowLocalAuthFallbacks } from "@/utils/runtime-env";

const SUPABASE_SESSION_TOKEN_KEY = "myeca:supabase-access-token";

export function hasStoredSupabaseSession() {
  if (typeof window === "undefined") return false;

  try {
    if (window.sessionStorage.getItem(SUPABASE_SESSION_TOKEN_KEY)) return true;

    for (let index = 0; index < window.localStorage.length; index += 1) {
      const key = window.localStorage.key(index);
      if (key?.startsWith("sb-") && key.endsWith("-auth-token")) {
        return true;
      }
    }
  } catch {
    return false;
  }

  return false;
}

export async function getAuthToken() {
  const temporaryToken = sessionStorage.getItem(TEMPORARY_TEST_AUTH_TOKEN_KEY);
  if (temporaryToken?.startsWith(TEMPORARY_TEST_AUTH_TOKEN_PREFIX)) {
    if (allowLocalAuthFallbacks()) {
      return temporaryToken;
    }

    sessionStorage.removeItem(TEMPORARY_TEST_AUTH_TOKEN_KEY);
  }

  if (temporaryToken) {
    sessionStorage.removeItem(TEMPORARY_TEST_AUTH_TOKEN_KEY);
  }

  const cachedToken = sessionStorage.getItem(SUPABASE_SESSION_TOKEN_KEY);
  if (cachedToken) return cachedToken;

  if (!hasStoredSupabaseSession()) return null;

  const { supabase } = await import("./supabase");
  const { data } = await supabase.auth.getSession();
  if (data.session?.access_token) {
    setAuthToken(data.session.access_token);
    return data.session.access_token;
  }

  return sessionStorage.getItem(SUPABASE_SESSION_TOKEN_KEY);
}

export function setAuthToken(token: string) {
  if (token.startsWith(TEMPORARY_TEST_AUTH_TOKEN_PREFIX)) {
    if (allowLocalAuthFallbacks()) {
      sessionStorage.setItem(TEMPORARY_TEST_AUTH_TOKEN_KEY, token);
    }
    return;
  }

  sessionStorage.setItem(SUPABASE_SESSION_TOKEN_KEY, token);
}

export function clearAuthToken() {
  sessionStorage.removeItem(TEMPORARY_TEST_AUTH_TOKEN_KEY);
  sessionStorage.removeItem(SUPABASE_SESSION_TOKEN_KEY);
}
