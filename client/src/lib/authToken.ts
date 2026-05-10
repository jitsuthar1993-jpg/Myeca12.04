import { supabase } from "./supabase";

const TEMPORARY_TOKEN_KEY = "token";

export async function getAuthToken() {
  const temporaryToken = sessionStorage.getItem(TEMPORARY_TOKEN_KEY);
  if (temporaryToken) return temporaryToken;

  const { data } = await supabase.auth.getSession();
  return data.session?.access_token ?? null;
}

export function setAuthToken(token: string) {
  sessionStorage.setItem(TEMPORARY_TOKEN_KEY, token);
}

export function clearAuthToken() {
  sessionStorage.removeItem(TEMPORARY_TOKEN_KEY);
}
