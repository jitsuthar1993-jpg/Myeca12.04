import { supabase } from "./supabase";
import {
  TEMPORARY_TEST_AUTH_TOKEN_KEY,
  TEMPORARY_TEST_AUTH_TOKEN_PREFIX,
} from "@/lib/temporary-test-users";

const SUPABASE_SESSION_TOKEN_KEY = "myeca:supabase-access-token";

export async function getAuthToken() {
  const temporaryToken = sessionStorage.getItem(TEMPORARY_TEST_AUTH_TOKEN_KEY);
  if (temporaryToken?.startsWith(TEMPORARY_TEST_AUTH_TOKEN_PREFIX)) {
    return temporaryToken;
  }

  if (temporaryToken) {
    sessionStorage.removeItem(TEMPORARY_TEST_AUTH_TOKEN_KEY);
  }

  const { data } = await supabase.auth.getSession();
  if (data.session?.access_token) {
    setAuthToken(data.session.access_token);
    return data.session.access_token;
  }

  return sessionStorage.getItem(SUPABASE_SESSION_TOKEN_KEY);
}

export function setAuthToken(token: string) {
  if (token.startsWith(TEMPORARY_TEST_AUTH_TOKEN_PREFIX)) {
    sessionStorage.setItem(TEMPORARY_TEST_AUTH_TOKEN_KEY, token);
    return;
  }

  sessionStorage.setItem(SUPABASE_SESSION_TOKEN_KEY, token);
}

export function clearAuthToken() {
  sessionStorage.removeItem(TEMPORARY_TEST_AUTH_TOKEN_KEY);
  sessionStorage.removeItem(SUPABASE_SESSION_TOKEN_KEY);
}
