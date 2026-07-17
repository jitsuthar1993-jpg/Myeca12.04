export type NotificationNavigationInput = {
  metadata?: Record<string, unknown> | null;
  actionUrl?: unknown;
};

const BLOCKED_NOTIFICATION_PATHS = new Set(["/auth/login", "/login", "/register"]);

export function getNotificationActionHref(
  notification: NotificationNavigationInput,
): string | null {
  const candidate =
    typeof notification.actionUrl === "string"
      ? notification.actionUrl
      : typeof notification.metadata?.actionUrl === "string"
        ? notification.metadata.actionUrl
        : null;

  if (!candidate || !candidate.startsWith("/") || candidate.startsWith("//")) {
    return null;
  }

  const pathname = candidate.split(/[?#]/, 1)[0];
  if (BLOCKED_NOTIFICATION_PATHS.has(pathname)) {
    return null;
  }

  return candidate;
}
