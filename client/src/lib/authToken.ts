import { supabase } from "./supabase";
import {
  TEMPORARY_TEST_AUTH_TOKEN_KEY,
  TEMPORARY_TEST_AUTH_TOKEN_PREFIX,
} from "@/lib/temporary-test-users";

export async function getAuthToken() {
  const temporaryToken = sessionStorage.getItem(TEMPORARY_TEST_AUTH_TOKEN_KEY);
  if (temporaryToken?.startsWith(TEMPORARY_TEST_AUTH_TOKEN_PREFIX)) {
    return temporaryToken;
  }

  if (temporaryToken) {
    sessionStorage.removeItem(TEMPORARY_TEST_AUTH_TOKEN_KEY);
  }

  const { data } = await supabase.auth.getSession();
  return data.session?.access_token ?? null;
}

export function setAuthToken(token: string) {
  sessionStorage.setItem(TEMPORARY_TEST_AUTH_TOKEN_KEY, token);
}

export function clearAuthToken() {
  sessionStorage.removeItem(TEMPORARY_TEST_AUTH_TOKEN_KEY);
}
