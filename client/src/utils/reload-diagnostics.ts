export type ReloadReason =
  | "stale_chunk"
  | "service_worker_dev_unregistered"
  | "login_redirect";

export interface ReloadAttempt {
  reason: ReloadReason;
  path: string;
  timestamp: number;
  attempts: number;
}

export const RELOAD_DIAGNOSTIC_KEY = "myeca:last-reload-attempt";

interface RecordReloadOptions {
  path?: string;
  now?: number;
  storage?: Storage | null;
}

function getDefaultStorage() {
  return typeof window === "undefined" ? null : window.sessionStorage;
}

function getDefaultPath() {
  return typeof window === "undefined" ? "/" : window.location.pathname || "/";
}

function parseAttempt(raw: string | null): ReloadAttempt | null {
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw) as Partial<ReloadAttempt>;
    if (!parsed.reason || !parsed.path || typeof parsed.timestamp !== "number") {
      return null;
    }

    return {
      reason: parsed.reason,
      path: parsed.path,
      timestamp: parsed.timestamp,
      attempts: typeof parsed.attempts === "number" ? parsed.attempts : 1,
    };
  } catch {
    return null;
  }
}

export function readLastReloadAttempt(storage: Storage | null = getDefaultStorage()) {
  try {
    return parseAttempt(storage?.getItem(RELOAD_DIAGNOSTIC_KEY) ?? null);
  } catch {
    return null;
  }
}

export function recordReloadAttempt(
  reason: ReloadReason,
  options: RecordReloadOptions = {},
): ReloadAttempt {
  const storage = options.storage ?? getDefaultStorage();
  const previous = readLastReloadAttempt(storage);
  const path = options.path ?? getDefaultPath();
  const timestamp = options.now ?? Date.now();
  const attempts = previous?.reason === reason && previous.path === path
    ? previous.attempts + 1
    : 1;
  const attempt = { reason, path, timestamp, attempts };

  try {
    storage?.setItem(RELOAD_DIAGNOSTIC_KEY, JSON.stringify(attempt));
  } catch {
    // Diagnostics must never block navigation or error recovery.
  }

  return attempt;
}
