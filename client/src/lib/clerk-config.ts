export const clerkPublishableKey =
  import.meta.env.VITE_CLERK_PUBLISHABLE_KEY ||
  import.meta.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY ||
  "";

export function isUsableClerkPublishableKey(key: unknown): key is string {
  if (typeof key !== "string") return false;

  const trimmed = key.trim();
  if (!/^(pk_live|pk_test)_/.test(trimmed) || trimmed.toLowerCase().includes("dummy")) {
    return false;
  }

  try {
    const encodedPayload = trimmed.replace(/^(pk_live|pk_test)_/, "");
    if (typeof atob !== "function") return false;

    const decodedPayload = atob(encodedPayload).toLowerCase();
    return !decodedPayload.includes("dummy-key");
  } catch {
    return false;
  }
}

export const isClerkEnabled = isUsableClerkPublishableKey(clerkPublishableKey);
