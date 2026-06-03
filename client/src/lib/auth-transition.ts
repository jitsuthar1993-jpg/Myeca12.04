const BACKGROUND_AUTH_EVENTS = new Set(["SIGNED_IN", "TOKEN_REFRESHED", "USER_UPDATED"]);

export function shouldUseBlockingAuthLoading(
  event: string,
  hasCurrentUser: boolean,
  hasSession: boolean,
) {
  if (!hasSession || !hasCurrentUser) {
    return true;
  }

  return !BACKGROUND_AUTH_EVENTS.has(event);
}
