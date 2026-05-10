import {
  TEMPORARY_TEST_AUTH_STORAGE_KEY,
  TEMPORARY_TEST_AUTH_TOKEN_KEY,
} from "@/lib/temporary-test-users";

export function clearTemporaryAuthState(storage: Storage | null = typeof window === "undefined" ? null : window.sessionStorage) {
  if (!storage) return;
  storage.removeItem(TEMPORARY_TEST_AUTH_STORAGE_KEY);
  storage.removeItem(TEMPORARY_TEST_AUTH_TOKEN_KEY);
}
