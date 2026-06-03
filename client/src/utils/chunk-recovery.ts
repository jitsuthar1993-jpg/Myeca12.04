import { recordReloadAttempt } from "@/utils/reload-diagnostics";

const CHUNK_RECOVERY_KEY = "myeca:chunk-recovery-attempted";
const CHUNK_RECOVERY_LAST_RELOAD_KEY = `${CHUNK_RECOVERY_KEY}:last-reload`;
const CHUNK_RECOVERY_COOLDOWN_MS = 30 * 1000;

interface ChunkRecoveryOptions {
  now?: () => number;
  pathname?: string;
  reloadPage?: () => void;
  storage?: Storage | null;
}

export function isRecoverableChunkError(error: unknown) {
  const details = [
    error instanceof Error ? error.name : "",
    error instanceof Error ? error.message : "",
    error instanceof Error ? error.stack : "",
    typeof error === "string" ? error : "",
  ].join(" ");

  return /ChunkLoadError|Loading chunk \d+ failed|Failed to fetch dynamically imported module|error loading dynamically imported module|Importing a module script failed|Failed to load module script|MIME type.*text\/html/i.test(details);
}

function getStorage(options: ChunkRecoveryOptions) {
  return options.storage ?? (typeof window === "undefined" ? null : window.sessionStorage);
}

function getPathname(options: ChunkRecoveryOptions) {
  return options.pathname ?? (typeof window === "undefined" ? "/" : window.location.pathname || "/");
}

function getReloadPage(options: ChunkRecoveryOptions) {
  return options.reloadPage ?? (() => window.location.reload());
}

function isInsideCooldown(storage: Storage, now: number) {
  const lastReloadAt = Number(storage.getItem(CHUNK_RECOVERY_LAST_RELOAD_KEY) || "0");
  return Number.isFinite(lastReloadAt) && lastReloadAt > 0 && now - lastReloadAt < CHUNK_RECOVERY_COOLDOWN_MS;
}

export async function recoverFromStaleChunk(error: unknown, options: ChunkRecoveryOptions = {}) {
  if (!isRecoverableChunkError(error) || typeof window === "undefined") {
    return false;
  }

  const storage = getStorage(options);
  const pathname = getPathname(options);
  const now = options.now?.() ?? Date.now();
  const recoveryKey = `${CHUNK_RECOVERY_KEY}:${pathname}`;

  try {
    if (!storage || storage.getItem(recoveryKey) || isInsideCooldown(storage, now)) {
      return false;
    }

    storage.setItem(recoveryKey, String(now));
    storage.setItem(CHUNK_RECOVERY_LAST_RELOAD_KEY, String(now));
  } catch {
    return false;
  }

  try {
    if ("caches" in window) {
      const cacheNames = await window.caches.keys();
      await Promise.all(cacheNames.map((cacheName) => window.caches.delete(cacheName)));
    }

    if ("serviceWorker" in navigator) {
      const registrations = await navigator.serviceWorker.getRegistrations();
      await Promise.all(registrations.map((registration) => registration.unregister()));
    }
  } catch {
    // Reloading is still useful even when cache cleanup is blocked by the browser.
  }

  recordReloadAttempt("stale_chunk", {
    path: pathname,
    now,
    storage,
  });
  getReloadPage(options)();
  return true;
}
